import React from 'react';
import { List, Map } from 'immutable';
import styles from 'dashboard/Data/Browser/ContextMenu.scss';

let ContextMenu = ({ position, entity, onFilterChange, hide }) => {
	if (!position) { return null; }

	const { pageX, pageY } = position;

	const pickFilter = (constraint) => {
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
			constraint,
			compareTo
		})));
		hide();
	}

	return <div className={styles.menu} style={{
		top: `${pageY}px`,
		left: `${pageX}px`
	}}>
		{/* TODO: menu items should be generated dynamically  */}
		<p className={styles.item} onClick={pickFilter.bind(this, 'exists')}>{entity.field} exists</p>
		<p className={styles.item} onClick={pickFilter.bind(this, 'dne')}>{entity.field} does not exist</p>
		<p className={styles.item} onClick={pickFilter.bind(this, 'eq')}>{entity.field} equals {entity.copyableValue}</p>
		<p className={styles.item} onClick={pickFilter.bind(this, 'neq')}>{entity.field} does not equal {entity.copyableValue}</p>

	</div>;
}

// BrowserContextMenu.propTypes = {
//   prop1: PropTypes.string.isRequired.describe('Replace me with the actual props'),
// }

export default ContextMenu;
