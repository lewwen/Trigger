import * as React from 'react';

const MaintSection = ({ title = null as string, children = null }) => <div className="group">
    {title ? <h2>{title}</h2> : null}
    {children}
</div>;

export default MaintSection;