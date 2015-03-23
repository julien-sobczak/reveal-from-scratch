/*
 * Based on the work of Hakim El Hattab.
 * 
 * reveal.js
 * http://lab.hakim.se/reveal-js
 * MIT licensed
 *
 * Copyright (C) 2015 Hakim El Hattab, http://hakim.se
 */

var Reveal;

(function() {

	'use strict';

	var SLIDES_SELECTOR = '.slides section',
		HORIZONTAL_SLIDES_SELECTOR = '.slides>section',
		VERTICAL_SLIDES_SELECTOR = '.slides>section.present>section',

		// The horizontal and vertical index of the currently active slide
		indexh,
		indexv,

		// Cached references to DOM elements
		dom = {};

	/**
	 * Starts up the presentation.
	 */
	function initialize() {

		// Make sure we've got all the DOM elements we need
		setupDOM();

		// Subscribe to input
		addEventListeners();
		
		// Read the initial hash
		readURL();
		
		// Enable only allowed controls
		updateControls();
		
	}

	/**
	 * Finds and stores references to DOM elements which are
	 * required by the presentation.
	 */
	function setupDOM() {

		// Cache references to elements
		dom.wrapper = document.querySelector( '.reveal' );
		dom.slides = document.querySelector( '.reveal .slides' );

		// There can be multiple instances of controls throughout the page
		dom.controlsLeft = document.querySelector( '.navigate-left' );
		dom.controlsRight = document.querySelector( '.navigate-right' );
		dom.controlsUp = document.querySelector( '.navigate-up' );
		dom.controlsDown = document.querySelector( '.navigate-down' );

	}

	/**
	 * Binds all event listeners.
	 */
	function addEventListeners() {

		window.addEventListener( 'hashchange', onWindowHashChange, false );
		window.addEventListener( 'resize', onWindowResize, false );
		document.addEventListener( 'keydown', onDocumentKeyDown, false );

		dom.controlsLeft.addEventListener( 'click', onNavigateLeftClicked, false );
		dom.controlsRight.addEventListener( 'click', onNavigateRightClicked, false ); 
		dom.controlsUp.addEventListener( 'click', onNavigateUpClicked, false ); 
		dom.controlsDown.addEventListener( 'click', onNavigateDownClicked, false );
		
	}


	/**
	 * Applies JavaScript-controlled layout rules to the presentation.
	 */
	function layout() {

		var size = {
			slideWidth: 960,
			slideHeight: 700,
			presentationWidth: dom.wrapper.offsetWidth,
			presentationHeight: dom.wrapper.offsetHeight
		};

		var slidePadding = 20; 

		dom.slides.style.width = size.slideWidth + 'px';
		dom.slides.style.height = size.slideHeight + 'px';

		// Determine scale of content to fit within available space
		var scale = Math.min( size.presentationWidth / size.slideWidth, size.presentationHeight / size.slideHeight );

		dom.slides.style.left = '50%';
		dom.slides.style.top = '50%';
		dom.slides.style.bottom = 'auto';
		dom.slides.style.right = 'auto';
		dom.slides.style.transform = 'translate(-50%, -50%) scale(' + scale + ')';

		// Select all slides, vertical and horizontal
		[].forEach.call( dom.wrapper.querySelectorAll( SLIDES_SELECTOR ), function (slide) {

			// Vertical stacks are not centered since their section
			// children will be
			if( slide.classList.contains( 'stack' ) ) {
				slide.style.top = 0;
			}
			else {
				slide.style.top = Math.max( ( ( size.slideHeight - slide.offsetHeight ) / 2 ) - slidePadding, 0 ) + 'px';
			}

		});

	}


	/**
	 * Steps from the current point in the presentation to the
	 * slide which matches the specified horizontal and vertical
	 * indices.
	 *
	 * @param {int} h Horizontal index of the target slide
	 * @param {int} v Vertical index of the target slide
	 */
	function slide( h, v ) {
		
		// Activate and transition to the new slide
		indexh = updateSlides( HORIZONTAL_SLIDES_SELECTOR, h === undefined ? indexh : h );
		indexv = updateSlides( VERTICAL_SLIDES_SELECTOR, v === undefined ? indexv : v );

		layout();

		updateControls();

	}


	/**
	 * Updates one dimension of slides by showing the slide
	 * with the specified index.
	 *
	 * @param {String} selector A CSS selector that will fetch
	 * the group of slides we are working with
	 * @param {Number} index The index of the slide that should be
	 * shown
	 *
	 * @return {Number} The index of the slide that is now shown,
	 * might differ from the passed in index if it was out of
	 * bounds.
	 */
	function updateSlides( selector, index ) {

		// Select all slides and convert the NodeList result to
		// an array
		var slides = [].slice.call( dom.wrapper.querySelectorAll( selector ) ),
			slidesLength = slides.length;

		if( slidesLength ) {

			for( var i = 0; i < slidesLength; i++ ) {
				var element = slides[i];

				element.classList.remove( 'past' );
				element.classList.remove( 'present' );
				element.classList.remove( 'future' );

				// If this element contains vertical slides
				if( element.querySelector( 'section' ) ) {
					element.classList.add( 'stack' );
				}

				if( i < index ) {
					// Any element previous to index is given the 'past' class
					element.classList.add( 'past' );
				}
				else if( i > index ) {
					// Any element subsequent to index is given the 'future' class
					element.classList.add( 'future' );
				}
			}

			// Mark the current slide as present
			slides[index].classList.add( 'present' );
		}
		else {
			// Since there are no slides we can't be anywhere beyond the
			// zeroth index
			index = 0;
		}

		return index;

	}

	/**
	 * Updates the state of all control/navigation arrows.
	 */
	function updateControls() {

		var routes = availableRoutes();

		// Remove the 'enabled' class from all directions
		dom.controlsLeft.classList.remove( 'enabled' );
		dom.controlsRight.classList.remove( 'enabled' );
		dom.controlsUp.classList.remove( 'enabled' );
		dom.controlsDown.classList.remove( 'enabled' );

		// Add the 'enabled' class to the available routes
		if( routes.left ) dom.controlsLeft.classList.add( 'enabled' );	
		if( routes.right ) dom.controlsRight.classList.add( 'enabled' );
		if( routes.up ) dom.controlsUp.classList.add( 'enabled' );	
		if( routes.down ) dom.controlsDown.classList.add( 'enabled' ); 
		
	}

	/**
	 * Determine what available routes there are for navigation.
	 *
	 * @return {Object} containing four booleans: left/right/up/down
	 */
	function availableRoutes() {

		var horizontalSlides = dom.wrapper.querySelectorAll( HORIZONTAL_SLIDES_SELECTOR ),
			verticalSlides = dom.wrapper.querySelectorAll( VERTICAL_SLIDES_SELECTOR );

		var routes = {
			left: indexh > 0,
			right: indexh < horizontalSlides.length - 1,
			up: indexv > 0,
			down: indexv < verticalSlides.length - 1
		};

		return routes;

	}

	/**
	 * Reads the current URL (hash) and navigates accordingly.
	 */
	function readURL() {

		var hash = window.location.hash;

		var bits = hash.slice( 2 ).split( '/' );

		// Read the index components of the hash
		var h = parseInt( bits[0], 10 ) || 0,
			v = parseInt( bits[1], 10 ) || 0;

		if( h !== indexh || v !== indexv ) {
			slide( h, v );
		}

	}


	function navigateLeft() {

		if( availableRoutes().left ) {
			slide( indexh - 1 );
		}

	}

	function navigateRight() {

		if( availableRoutes().right ) {
			slide( indexh + 1 );
		}

	}

	function navigateUp() {

		if( availableRoutes().up ) {
			slide( indexh, indexv - 1 );
		}

	}

	function navigateDown() {

		if( availableRoutes().down ) {
			slide( indexh, indexv + 1 );
		}

	}


	// --------------------------------------------------------------------//
	// ----------------------------- EVENTS -------------------------------//
	// --------------------------------------------------------------------//


	/**
	 * Handler for the document level 'keydown' event.
	 */
	function onDocumentKeyDown( event ) {

		switch( event.keyCode ) {
			// h, left
			case 72: case 37: navigateLeft(); break;
			// l, right
			case 76: case 39: navigateRight(); break;
			// k, up
			case 75: case 38: navigateUp(); break;
			// j, down
			case 74: case 40: navigateDown(); break;
			// home
			case 36: slide( 0 ); break;
			// end
			case 35: slide( Number.MAX_VALUE ); break;
		}

	}

	function onNavigateLeftClicked( event ) { event.preventDefault(); navigateLeft(); }
	function onNavigateRightClicked( event ) { event.preventDefault(); navigateRight(); }
	function onNavigateUpClicked( event ) { event.preventDefault(); navigateUp(); }
	function onNavigateDownClicked( event ) { event.preventDefault(); navigateDown(); }
	function onWindowHashChange( event ) { readURL(); }
	function onWindowResize( event ) { layout(); }


	// --------------------------------------------------------------------//
	// ------------------------------- API --------------------------------//
	// --------------------------------------------------------------------//


	Reveal = {
		initialize: initialize,

		// Navigation methods
		slide: slide,
		left: navigateLeft,
		right: navigateRight,
		up: navigateUp,
		down: navigateDown,
	};

})();
