 # Using ActionCable and React in a Rails 5 Samvera app
 This is a sample application to demo ActionCable and React in a Samvera application.  
 
 To follow along with these instructions, checkout the 'master' branch.  To see a complete application, checkout 'complete' branch.
 
 ### Review starting place
   - Using Hyrax Template from samvera on Github
   - [https://github.com/samvera/hyrax](https://github.com/samvera/hyrax)
 
## Create a LiveSearch Component
#### /app/javascript/components/LiveSearch.js
```javascript
import React, { Component } from 'react';

export default class LiveSearch extends Component {
  render() {
    return (
      <h3>Live Search</h3>
    );
  }
}
```

## Create a LiveSearch Pack
#### /app/javascript/packs/LiveSearch.js
```javascript
import LiveSearch from '../components/LiveSearch'
import WebpackerReact from 'webpacker-react'

WebpackerReact.setup({LiveSearch})
```

## add javascript_pack_tag to layout header
#### /app/views/layouts/_head_tag_content.html.erb
```html
<%= javascript_pack_tag 'LiveSearch' %>
```

## Add _search_sidebar.html.erb partial
#### /app/views/catalog/_search_sidebar.html.erb
```html
<h1>Sidebar</h1>
<%= react_component('LiveSearch') %>
```

## Working with ActionCable
```
$ rails g channel live_search
```

## stream from live_search
#### /app/channels/live_search_channel.rb
```ruby
class LiveSearchChannel < ApplicationCable::Channel
  def subscribed
    stream_from "live_search"
  end

  def unsubscribed
    # Any cleanup needed when channel is unsubscribed
  end
end
```

## Broadcast search queries
#### /app/controllers/catalog_controller.rb
```ruby
class CatalogController < ApplicationController
  include Hydra::Catalog
  include Hydra::Controller::ControllerBehavior

  before_action :broadcast_live_search

  def broadcast_live_search
    if params[:q]
      ActionCable.server.broadcast "live_search", params[:q]
    end
  end

  #......
end
```

## Subscribe from React
#### /app/javascript/components/LiveSearch.js
```javascript
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
              <div class='card-body'>
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
```



## HYRAX and ActionCable
Hyrax already makes use of ActionCable for authenticated user actions.  Take a look at the connection that Hyrax makes:

```ruby
module Hyrax
  module ApplicationCable
    class Connection < ActionCable::Connection::Base
      identified_by :current_user

      def connect
        self.current_user = find_verified_user
      end

      private

        def find_verified_user
          user = ::User.find_by(id: user_id)
          if user
            user
          else
            reject_unauthorized_connection
          end
        end

        def user_id
          session['warden.user.user.key'][0][0]
        rescue NoMethodError
          nil
        end

        def session
          cookies.encrypted[Rails.application.config.session_options[:key]]
        end
    end
  end
end
```
Here we can see that websocket connections are being authenticated, and rejected if the user is not logged in.  
