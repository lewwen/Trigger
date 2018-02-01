import * as React from 'react';
import strings from '../strings';
import SearchableItemsListing from '../components/SearchableItemsListing';

interface SearchableItem {
	id: string;
	text: string;
}


let SearchItems = ({ items = [] as SearchableItem[], selectedTriggerUrl = '' , 
selectedId = null as string | number, onDelete = (id: string): void => null, 
urlCreator = (id: string): string => null }) => {
	var a :string;	
	var filtedItems:SearchableItem[];
	function changeInput (filtedstring : string, filteditems:SearchableItem[] ) {
    	filteditems = items.filter(x=>x.text.indexOf (filtedstring) > -1);
 	}	


	return <div className="groupContent">
    <table style={{width: '100%', border: '0px none', padding: '0px'}} cellSpacing={0}>
		<tbody>
			<tr id="taskTriggersList_searchBox_searchFilterRow">
				<td colSpan={3}>
					<input type="text" style={{width: '100%', borderColor: '#ccc', borderWidth: '1px', paddingLeft: '5px'}} 
					onChange={event => changeInput((event.target as HTMLInputElement).value,filtedItems)}
					name="search" placeholder={strings.filterDotDot} />
				</td>
				<td width="20px">
					<a className="image-close" style={{margin: '8px'}} />
				</td>
			</tr>
		</tbody>
	</table>

	 <SearchableItemsListing items={items} selectedId={selectedId} selectedTriggerUrl={selectedTriggerUrl} urlCreator={urlCreator} onDelete={(id) => this.props.actions.deleteTrigger(id)} />
</div>;
}

export default SearchItems;