import React from 'react';
import { CollapsibleSection } from './CollapsibleSection';
export function OriginalImageSection({ img }) {
    return (<CollapsibleSection title="Original image" defaultOpen={false}>
    <div className="control-group">
        <img src={img}/>
    </div>
    </CollapsibleSection>);
}
//# sourceMappingURL=OriginalImageSection.js.map