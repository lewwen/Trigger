import * as React from 'react';

let Link = ({url = '', icon = '', text = ''}) => <div className="groupContent">
	<a className="link" href={url}>
		<span className={`image-${icon}`} />
	</a>
	<a className="link" href={url}>{text}</a>
</div>;

export default Link;