
import React                            from 'react';
import Masonry                          from 'react-masonry-component';

import { getSimpleFunctionSignature }   from 'dashboard/Data/Docs/AbiUtils';
import DocCard                          from 'dashboard/Data/Docs/DocCard.react';
import styles                           from 'dashboard/Data/Docs/DocsContracts.scss';

import ChromeDropdown                   from 'components/ChromeDropdown/ChromeDropdown.react';

import queryFromFilters                 from 'lib/queryFromFilters';

const MAX_ROWS_FETCHED = 1000;
const DEFAULT = 'default';

export default class DocsContracts extends React.Component {
    constructor(props) {
        super(props);

        this.fetchData = this.fetchData.bind(this);
        this.handleBlockchainSelect = this.handleBlockchainSelect.bind(this);

        this.state = {
            data: [],
            filteredData: [],
            selectedBlockchain: DEFAULT,
            blockchains: [],
            blockchainData: {},
            lastMax: 0
        }
    }

    componentWillMount() {
        this.fetchData('');
    }

    async fetchData() {
        const data = await this.fetchParseData();
        const filterMap = {};
        const processedBlockchains = {};
        data.blockchains.forEach(obj => {
            const blockchainData = {...obj.attributes};
            processedBlockchains[blockchainData.networkId] = blockchainData;
        });

        data.deploymentArtifacts.forEach(obj => {
            const objFields = {...obj.attributes};

            objFields.metadataJson = JSON.parse(obj.get('metadata' || '{}'));
            objFields.contractName = Object.values(objFields.metadataJson?.settings?.compilationTarget)[0];
            objFields.filePath = Object.keys(objFields.metadataJson?.settings?.compilationTarget)[0];

            const abi = objFields.metadataJson.output?.abi;
            const abiEvents = [];
            const abiWriteFn = [];
            const abiReadFn = [];

            abi.forEach((abiObj) => {
                if (abiObj.type === 'event') {
                    abiEvents.push(abiObj);
                } else if (abiObj.type === 'function' && abiObj.stateMutability === 'view') {
                    abiReadFn.push(abiObj);
                } else {
                    abiWriteFn.push(abiObj);
                }
            });

            const abiSortFn = (a, b) => {
                return a.name.localeCompare(b.name);
            };

            abiEvents.sort(abiSortFn);
            abiReadFn.sort(abiSortFn);
            abiWriteFn.sort(abiSortFn);

            const sections = objFields.sections = [];
            if (abiEvents.length > 0) {
                sections.push({
                    title: 'Events',
                    data: abiEvents,
                });
            }
            if (abiReadFn.length > 0) {
                sections.push({
                    title: 'Read Functions',
                    data: abiReadFn,
                });
            }
            if (abiWriteFn.length > 0) {
                sections.push({
                    title: 'Write Functions',
                    data: abiWriteFn,
                });
            }

            const blockchainId = objFields.blockchain.attributes.networkId;
            const objectAddress = objFields.address;

            if (!filterMap[blockchainId]) {
                filterMap[blockchainId] = {
                    contracts: []
                };
            }

            // only add to the list if it has sections (events, functions) from the abi
            if (!filterMap[blockchainId][objectAddress] && sections.length > 0) {
                filterMap[blockchainId][objectAddress] = true;
                filterMap[blockchainId].contracts.push(objFields);
            }
            return objFields;
        });

        const sortFn = (a, b) => {
            return a.contractName.localeCompare(b.contractName);
        };

        const blockchainIds = Object.keys(filterMap);
        const processedDeploymentArtifacts = [];
        blockchainIds.forEach(id => {
            filterMap[id].contracts.sort(sortFn);
            processedDeploymentArtifacts.push(...filterMap[id].contracts);
        });


        this.setState({ 
            blockchains: blockchainIds,
            blockchainData: processedBlockchains, 
            data: processedDeploymentArtifacts, 
            filteredData: processedDeploymentArtifacts, 
            lastMax: MAX_ROWS_FETCHED });
    }

    async fetchParseData() {
        const { useMasterKey } = this.state;
        const daQuery = queryFromFilters('DeploymentArtifact', []);
        daQuery.descending('createdAt')
        daQuery.limit(MAX_ROWS_FETCHED);
        const deploymentArtifactResultsPromise = daQuery.find({ useMasterKey });
        
        const bcQuery = queryFromFilters('Blockchain', []);
        const blockchainResultsPromise = bcQuery.find({ useMasterKey });

        const [deploymentArtifacts, blockchains] = await Promise.all([deploymentArtifactResultsPromise, blockchainResultsPromise]);
        return {
            deploymentArtifacts,
            blockchains,
        };
    }

    handleBlockchainSelect(blockchainId) {
        let filteredData = this.state.data;
        if (blockchainId !== DEFAULT) {
            blockchainId = parseInt(blockchainId)
            // double equals comparison in filter is intentional for string/number 
            filteredData = this.state.data.filter(obj => obj.blockchain.attributes.networkId == blockchainId);
        }

        this.setState({ 
            selectedBlockchain: blockchainId,
            filteredData: filteredData,
        });
    }

    render() {
        let docCards = this.state.filteredData?.map((deploymentArtifact) => {
            // get blockchain 
            const blockchainId = deploymentArtifact.blockchain.attributes.networkId;
            const address = deploymentArtifact.address;
            const metadata = deploymentArtifact.metadataJson;
            const name = deploymentArtifact.contractName;
            const filePath = deploymentArtifact.filePath; 

            const sectionsHtml = deploymentArtifact.sections.map(section => {
                return (
                    <section>
                        <h3 className={styles.subsectionTitle}>{section.title}</h3>
                        <ul>
                            {section.data.map(abiObj => {
                                const methodSig = getSimpleFunctionSignature(abiObj)
                                return (<li className={styles.methodDocs} key={methodSig}>
                                    <span>{methodSig}</span>
                                    {/* TODO: display any comments from the devdocs/userdocs -- need util function to generate method sig with just types as key to lookup docs*/}
                                    {/* <span>{metadata.output.devdoc.methods[abiObj].details}</span> */}
                                </li>);
                            })}
                        </ul>
                    </section>
                );
            });

            // const devDocMethods = Object.keys(metadata.output?.devdoc?.methods);
            // const userDocMethods = Object.keys(metadata.output?.userdoc.methods);
            // const devDocHtml = devDocMethods.map(method => {
            //     return (
            //         <div className={styles.methodDocs} key={method}>
            //             <span>{method}</span>
            //             <span>{metadata.output.devdoc.methods[method].details}</span>
            //         </div>
            //     );
            // });
            // const userDocHtml = userDocMethods.map(method => {
            //     return (
            //         <div className={styles.methodDocs} key={method}>
            //             <span>{method}</span>
            //             <span>{metadata.output.userdoc.methods[method].notice}</span>
            //         </div>
            //     );
            // });

            return (
                <DocCard title={name} key={blockchainId + address}>
                    {/* <div>{devDocHtml}</div> */}
                    {/* <div>{userDocHtml}</div> */}
                    <div>{sectionsHtml}</div>
                </DocCard>
            );
        });

        const blockchainOptions = this.state.blockchains.map(blockchainId => {
            return {
                key: blockchainId,
                value: this.state.blockchainData[blockchainId].name
            }
        });
        blockchainOptions.unshift({ key: DEFAULT, value: 'All Blockchains' });

        return (
            <div>
                <div>
                    <ChromeDropdown
                        placeholder={'Filter by blockchain'}
                        value={this.state.selectedBlockchain}
                        onChange={this.handleBlockchainSelect}
                        options={blockchainOptions} 
                        width={200}/> 
                </div>

                <Masonry className="docs" elementType={'div'} options={{ transitionDuration: 200, stagger: 30 }}>
                    {docCards}
                </Masonry>
            </div>
        );
    }
}

