# binary-lazy-loading
Instead of brute forcing the entire list of images to be lazily loaded, use binary search algorithm to minimize looping of testing whether the element is in view port or not. 
 ## Configure
Call `registerLazyImageScrollHandler()` in `componentDidMount` of root class to register scroll listener. 

 ## How to use it ?
 
Import it using the below 

`import LazyImage from 'lazy-image'` 


`<LazyImage src={this.props.src} />`.

And that will lazy load the image with optimized version of lazy loading. 
