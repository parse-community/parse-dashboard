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
		onFilterChange(filters.push(new Map({
			field: entity.field,
			constraint: 'eq',
			compareTo: entity.value
		})));
		hide();
	}}
	>Filter by this value</div>;
}

// BrowserContextMenu.propTypes = {
//   prop1: PropTypes.string.isRequired.describe('Replace me with the actual props'),
// }

export default ContextMenu;
