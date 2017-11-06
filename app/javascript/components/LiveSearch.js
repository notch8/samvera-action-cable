import React, { Component } from 'react';

export default class LiveSearch extends Component {
  constructor(props){
    super(props)
    this.state = {
      searches: []
    }
  }

  componentWillMount(){
    App.cable.subscriptions.create('LiveSearchChannel',
    {
       received: function(data){
         const newSearches = this.state.searches.slice(0)
         newSearches.push(data)
         this.setState({searches: newSearches})
       }.bind(this)
     })
  }

  render() {
    return (
      <div>
        <h3>Live Search</h3>
        <h5>Check out some of these search by other users</h5>
        {this.state.searches.map((search, index)=>{
          return(
            <div key={index}>
              <div className='card-body'>
                <a href={`/catalog?utf8=✓&locale=en&search_field=all_fields&q=${search}`}>
                  {search}
                </a>
              </div>
            </div>
          )
        })}
      </div>
    );
  }
}

