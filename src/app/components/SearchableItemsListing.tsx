import * as React from 'react';
import strings from '../strings';

interface SearchableItem {
	id: string;
	text: string;
}

let ItemEntry = ({ text = '', url = '', triggerId = '', selectedTriggerUrl = '', selected = null as boolean, onDelete = (id: string): void => null}) => <tr className="itemListingRow">
	<td style={{width: '20px'}}>
		<a className={`image-position-${selected ? 'active' : 'inactive'}`} />
	</td>
	<td>
		<a className="link" href={url}>{text}</a>
	</td>
	
	{
		onDelete ?
		<td style={{width: '20px'}}>		
		<a onClick={() => {if(confirm(strings.confirmDeleteEntry)){location.href = selectedTriggerUrl + '&deletedId=' + triggerId}else{event.cancelBubble = true; event.returnValue = false; return false;}}} className="image-delete" style={{float: 'right'}} ></a>	
			
		</td>
	:
		<span />
	}
	
</tr>;

let SearchableItemsListing = ({ items = [] as SearchableItem[], selectedTriggerUrl = '' , selectedId = null as string | number, onDelete = (id: string): void => null, urlCreator = (id: string): string => null }) => <div className="groupContent">
	
	<table style={{width: '100%', border: '0px none', padding: '0px'}} cellSpacing={0}>
		<tbody>
			<tr>
				<td colSpan={4} style={{paddingBottom: '5px', paddingTop: '3px'}}>
					<hr style={{width: '80%', margin: '0 auto'}} />
				</td>
			</tr>
			
			{items.map(item => <ItemEntry key={item.id} text={item.text} triggerId={item.id} selectedTriggerUrl={selectedTriggerUrl} selected={item.id == selectedId} url={urlCreator(item.id)} onDelete={() => { onDelete(item.id); return true; }} />)}
			
    		<tr>
				<td colSpan={4}>
					<br />
				</td>
			</tr>
		</tbody>
	</table>
</div>;

export default SearchableItemsListing;