/* global WOW */
import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';

import axios from 'axios'




import LazyImage from './lazy-image'
import { registerLazyImageScrollHandler } from './lazy-image/scroll-helper'

const INHOUSE = true

class App extends Component {

  state = { list : []}

  componentDidMount() { 

    var wow = new WOW(
      {
        boxClass:     'wow',      // animated element css class (default is wow)
        animateClass: 'animated', // animation css class (default is animated)
        offset:       0,          // distance to the element when triggering the animation (default is 0)
        mobile:       true,       // trigger animations on mobile devices (default is true)
        live:         true,       // act on asynchronously loaded content (default is true)
        callback:     function(box) {
          // the callback is fired every time an animation is started
          // the argument that is passed in is the DOM node being animated
          box.children[0].src = box.children[0].getAttribute('data-src')
        },
        scrollContainer: null // optional scroll container selector, otherwise use window
      }
    );
    wow.init();

    registerLazyImageScrollHandler()

    axios.get('https://api.myjson.com/bins/8llh0').then( response => {
      // response.data.listings.length = 50
      this.setState({
        list : response.data.listings
      }, () => setInterval(() => document.scrollingElement.scrollBy(0,100),10) )
    })
  }

  render() {
    return (
      <div className="App">
        <header className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <h1 className="App-title">Welcome to React</h1>
        </header>
        <p className="App-intro">
          To get started, edit <code>src/App.js</code> and save to reload.
        </p>

        {
          this.state.list.map( (item, index) => {
              return <div className="wow" style={{ height : '150px', padding: '10px'}}>
              { INHOUSE ? 
                  <LazyImage key={index} src={item.singleData ? item.singleData.BannerURL : ''} /> :
                  <img key={index} data-src={item.singleData ? item.singleData.BannerURL : ''} /> 
              }
              </div>
          })
        }
      </div>
    );
  }
}

export default App;
