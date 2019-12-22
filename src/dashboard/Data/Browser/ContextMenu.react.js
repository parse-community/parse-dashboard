import React from 'react';
import { List, Map } from 'immutable';

let ContextMenu = ({ position, entity, onFilterChange, hide }) => {
	if (!position) { return null; }

	const { pageX, pageY } = position;


	return <div style={{
		position: 'absolute',
		border: '1px solid',
		background: '#797691',
		color: 'white',
		top: `${pageY}px`,
		left: `${pageX}px`,
		padding: '0.5rem',
		cursor: 'pointer'
	}} onClick={() => {
		const filters = new List();


		let compareTo;
		switch (entity.type) {
			case 'Pointer':
				compareTo = entity.value.toPointer();
				break;
			// TODO: handle other types

			default:
				compareTo = entity.value;
		}

		onFilterChange(filters.push(new Map({
			field: entity.field,
			// TODO: handle different constraints
			constraint: 'eq',
			compareTo
		})));
		hide();
	}}
	>Filter by this value</div>;
}

// BrowserContextMenu.propTypes = {
//   prop1: PropTypes.string.isRequired.describe('Replace me with the actual props'),
// }

export default ContextMenu;
