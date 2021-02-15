import React from 'react';
import './Track.css';

export class Track extends React.Component {

    constructor(props) {
        super(props);
        this.renderAction = this.renderAction.bind(this);
    }
    
    renderAction() {
        // replace original button with conditional based on isRemoval prop
        // if (isRemoval) {
        //     return <button className="Track-action">-</button>
        // } 
        // return <button className="Track-action">+</button>
    }
    
    render() {
        return(
            <div className="Track">
                <div className="Track-information">
                    <h3>
                        {this.props.track.name}
                    </h3>
                    <p>
                        {this.props.track.artist} | {this.props.track.album}
                    </p>
                </div>
                {this.renderAction()}
            </div>
        )
    }
}