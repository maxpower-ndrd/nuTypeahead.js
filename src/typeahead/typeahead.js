/*
 * typeahead.js
 * https://github.com/twitter/typeahead.js
 * Copyright 2013-2014 Twitter, Inc. and other contributors; Licensed MIT
 */

var Typeahead = (function() {
  'use strict';

  // constructor
  // -----------

  function Typeahead(o, www) {
    var onFocused, onBlurred, onEnterKeyed, onTabKeyed, onEscKeyed, onUpKeyed,
        onDownKeyed, onLeftKeyed, onRightKeyed, onQueryChanged,
        onWhitespaceChanged;

    o = o || {};

    if (!o.input) {
      $.error('missing input');
    }

    if (!o.menu) {
      $.error('missing menu');
    }

    if (!o.eventBus) {
      $.error('missing event bus');
    }

    www.mixin(this);

    this.eventBus = o.eventBus;
    this.minLength = _.isNumber(o.minLength) ? o.minLength : 1;

    this.input = o.input;
    this.menu = o.menu;

    this.enabled = true;

    // activate the typeahead on init if the input has focus
    this.active = false;
    this.input.hasFocus() && this.activate();

    // detect the initial lang direction
    this.dir = this.input.getLangDir();

    this._hacks();

    this.menu.bind()
    .onSync('selectableClicked', this._onSelectableClicked, this)
    .onSync('asyncRequested', this._onAsyncRequested, this)
    .onSync('asyncCanceled', this._onAsyncCanceled, this)
    .onSync('asyncReceived', this._onAsyncReceived, this)
    .onSync('datasetRendered', this._onDatasetRendered, this)
    .onSync('datasetCleared', this._onDatasetCleared, this);

    // composed event handlers for input
    onFocused = c(this, 'activate', 'open', '_onFocused');
    onBlurred = c(this, 'deactivate', '_onBlurred');
    onEnterKeyed = c(this, 'isActive', 'isOpen', '_onEnterKeyed');
    onTabKeyed = c(this, 'isActive', 'isOpen', '_onTabKeyed');
    onEscKeyed = c(this, 'isActive', '_onEscKeyed');
    onUpKeyed = c(this, 'isActive', 'open', '_onUpKeyed');
    onDownKeyed = c(this, 'isActive', 'open', '_onDownKeyed');
    onLeftKeyed = c(this, 'isActive', 'isOpen', '_onLeftKeyed');
    onRightKeyed = c(this, 'isActive', 'isOpen', '_onRightKeyed');
    onQueryChanged = c(this, '_openIfActive', '_onQueryChanged');
    onWhitespaceChanged = c(this, '_openIfActive', '_onWhitespaceChanged');

    this.input.bind()
    .onSync('focused', onFocused, this)
    .onSync('blurred', onBlurred, this)
    .onSync('enterKeyed', onEnterKeyed, this)
    .onSync('tabKeyed', onTabKeyed, this)
    .onSync('escKeyed', onEscKeyed, this)
    .onSync('upKeyed', onUpKeyed, this)
    .onSync('downKeyed', onDownKeyed, this)
    .onSync('leftKeyed', onLeftKeyed, this)
    .onSync('rightKeyed', onRightKeyed, this)
    .onSync('queryChanged', onQueryChanged, this)
    .onSync('whitespaceChanged', onWhitespaceChanged, this)
    .onSync('langDirChanged', this._onLangDirChanged, this);
  }

  // instance methods
  // ----------------

  _.mixin(Typeahead.prototype, {

    // here's where hacks get applied and we don't feel bad about it
    _hacks: function hacks() {
      var $input, $menu;

      // these default values are to make testing easier
      $input = this.input.$input || $('<div>');
      $menu = this.menu.$node || $('<div>');

      // #705: if there's scrollable overflow, ie doesn't support
      // blur cancellations when the scrollbar is clicked
      //
      // #351: preventDefault won't cancel blurs in ie <= 8
      $input.on('blur.tt', function($e) {
        var active, isActive, hasActive;

        active = document.activeElement;
        isActive = $menu.is(active);
        hasActive = $menu.has(active).length > 0;

        if (_.isMsie() && (isActive || hasActive)) {
          $e.preventDefault();
          // stop immediate in order to prevent Input#_onBlur from
          // getting exectued
          $e.stopImmediatePropagation();
          _.defer(function() { $input.focus(); });
        }
      });

      // #351: prevents input blur due to clicks within menu
      $menu.on('mousedown.tt', function($e) { $e.preventDefault(); });
    },

    // ### event handlers

    _onSelectableClicked: function onSelectableClicked(type, $el) {
      this.select($el);
    },

    _onDatasetCleared: function onDatasetCleared() {
      this._updateHint();
    },

    _onDatasetRendered: function onDatasetRendered(type, dataset, suggestions, async) {
      this._updateHint();
      this.eventBus.trigger('render', suggestions, async, dataset);
    },

    _onAsyncRequested: function onAsyncRequested(type, dataset, query) {
      this.eventBus.trigger('asyncrequest', query, dataset);
    },

    _onAsyncCanceled: function onAsyncCanceled(type, dataset, query) {
      this.eventBus.trigger('asynccancel', query, dataset);
    },

    _onAsyncReceived: function onAsyncReceived(type, dataset, query) {
      this.eventBus.trigger('asyncreceive', query, dataset);
    },

    _onFocused: function onFocused() {
      this._minLengthMet() && this.menu.update(this._getActiveToken());
    },

    _onBlurred: function onBlurred() {
      if (this.input.hasQueryChangedSinceLastFocus()) {
        this.eventBus.trigger('change', this._getActiveToken());
      }
    },

    _onEnterKeyed: function onEnterKeyed(type, $e) {
      var $selectable;

      if ($selectable = this.menu.getActiveSelectable()) {
        this.select($selectable) && $e.preventDefault();
      }
    },

    _onTabKeyed: function onTabKeyed(type, $e) {
      var $selectable;

      if ($selectable = this.menu.getActiveSelectable()) {
        this.select($selectable) && $e.preventDefault();
      }

      else if ($selectable = this.menu.getTopSelectable()) {
        this.autocomplete($selectable) && $e.preventDefault();
      }
    },

    _onEscKeyed: function onEscKeyed() {
      this.close();
    },

    _onUpKeyed: function onUpKeyed() {
      this.moveCursor(-1);
    },

    _onDownKeyed: function onDownKeyed() {
      this.moveCursor(+1);
    },

    _onLeftKeyed: function onLeftKeyed() {
      if (this.dir === 'rtl' && this.input.isCursorAtEnd()) {
        this.autocomplete(this.menu.getTopSelectable());
      }
    },

    _onRightKeyed: function onRightKeyed() {
      if (this.dir === 'ltr' && this.input.isCursorAtEnd()) {
        this.autocomplete(this.menu.getTopSelectable());
      }
    },

    _onQueryChanged: function onQueryChanged(e, query) {
    	var trig = this._getActiveTrigger();
    	if (trig === null || trig === undefined) return false;

    	if (this.menu.datasets !== null && this.menu.datasets.length !== 0) {
    		for (var i = 0; i < this.menu.datasets.length; i++) {
    			if (this.menu.datasets[i].triggerchar == trig) {
    				this.menu.triggerchar = trig;
    			}
    		}
    	}

    	// this.menu.update(this._getActiveToken);
    	return this._minLengthMet(this._getActiveToken()) ? this.menu.update(this._getActiveToken()) : this.menu.empty();
    	//     	return this._minLengthMet(this._getActiveToken()) ? this.menu.update(this._getActiveToken()) : this.menu.empty();

    	//this._minLengthMet(this._getActiveToken()) ? this.menu.update(this._getActiveToken()) : this.menu.empty();
    },

    _onWhitespaceChanged: function onWhitespaceChanged() {
      this._updateHint();
    },

    _onLangDirChanged: function onLangDirChanged(e, dir) {
      if (this.dir !== dir) {
        this.dir = dir;
        this.menu.setLanguageDirection(dir);
      }
    },

    // ### private

    _openIfActive: function openIfActive() {
      this.isActive() && this.open();
    },

    _minLengthMet: function minLengthMet(query) {
			var token = this._getActiveToken();
			if (token == null){ return false; }
			return token.length >= this.minLength;
    },

    _updateHint: function updateHint() {
      var $selectable, data, val, query, escapedQuery, frontMatchRegEx, match;

      $selectable = this.menu.getTopSelectable();
      data = this.menu.getSelectableData($selectable);
      val = this.input.getInputValue();

      if (data && !_.isBlankString(val) && !this.input.hasOverflow()) {
        query = Input.normalizeQuery(val);
        escapedQuery = _.escapeRegExChars(query);

        // match input value, then capture trailing text
        frontMatchRegEx = new RegExp('^(?:' + escapedQuery + ')(.+$)', 'i');
        match = frontMatchRegEx.exec(data.val);

        // clear hint if there's no trailing text
        match && this.input.setHint(val + match[1]);
      }

      else {
        this.input.clearHint();
      }
    },
  	// this will return the active trigger, if one found based on datasets array
    _getActiveTrigger: function getActiveTrigger() {
    	var value = this._getActiveWord();
    	if (value === null) return null;

    	// if the first character of the active word matches a trigger character from a dataset, return it
    	if (this.menu.datasets !== null && this.menu.datasets !== undefined && this.menu.datasets.length !== 0) {
    		for (var i = 0; i < this.menu.datasets.length; i++) {
    			if (value.substring(0, 1) === this.menu.datasets[i].triggerchar)
    				return this.menu.datasets[i].triggerchar;
    		}
    	}

    	return null;
    },
  	// this will return the active word. "this is a token" would return "token"
    _getActiveWord: function getActiveWord(value){
    	if (value === null || value === undefined) { value = this.input.getQuery(); }
    	if (value !== null && value !== undefined && value.length > 0) {
    		var tokens = value.split(' ');
    		if (tokens.length !== 0) {
    			return tokens[tokens.length - 1];
    		}
    	}

    	return null;
    },
		//  this will return the token without the trigger
    _getActiveToken: function getActiveToken(value) {
			if (this._getActiveTrigger() === null) {
    		return null;  // if there is no active trigger, there is no token
    	}

			// if there's a token, strip it and return word
    	var word=this._getActiveWord().substring(1);
    	return (word===null || word===undefined || word=='') ? null : word;
    },
		// this will return the existing text minus the active token and the trigger
    _getWithoutActiveToken: function getWithoutActiveToken(){
        var value = this.input.getQuery();
        var activeToken = this._getActiveToken();
        if (activeToken && value) {
            value = value.substring(0, value.length - activeToken.length - 1);
        }
        return value;
    },


    // ### public

    isEnabled: function isEnabled() {
      return this.enabled;
    },

    enable: function enable() {
      this.enabled = true;
    },

    disable: function disable() {
      this.enabled = false;
    },

    isActive: function isActive() {
      return this.active;
    },

    activate: function activate() {
      // already active
      if (this.isActive()) {
        return true;
      }

      // unable to activate either due to the typeahead being disabled
      // or due to the active event being prevented
      else if (!this.isEnabled() || this.eventBus.before('active')) {
        return false;
      }

      // activate
      else {
        this.active = true;
        this.eventBus.trigger('active');
        return true;
      }
    },

    deactivate: function deactivate() {
      // already idle
      if (!this.isActive()) {
        return true;
      }

      // unable to deactivate due to the idle event being prevented
      else if (this.eventBus.before('idle')) {
        return false;
      }

      // deactivate
      else {
        this.active = false;
        this.close();
        this.eventBus.trigger('idle');
        return true;
      }
    },

    isOpen: function isOpen() {
      return this.menu.isOpen();
    },

    open: function open() {
      if (this._getActiveToken() == null){ return; }

      if (!this.isOpen() && !this.eventBus.before('open')) {
        this.menu.open();
        this._updateHint();
        this.eventBus.trigger('open');
      }

      return this.isOpen();
    },

    close: function close() {
      if (this.isOpen() && !this.eventBus.before('close')) {
        this.menu.close();
        this.input.clearHint();
        this.input.resetInputValue();
        this.eventBus.trigger('close');
      }
      return !this.isOpen();
    },

    setVal: function setVal(val) {
      // expect val to be a string, so be safe, and coerce
      this.input.setQuery(_.toStr(val));
    },

    getVal: function getVal() {
      return this.input.getQuery();
    },

    select: function select($selectable) {
      var data = this.menu.getSelectableData($selectable);

      if (data && !this.eventBus.before('select', data.obj)) {
        // if the trigger is blank and the input contains text, then add a space. otherwise, the input
      	// will contain "some text <trigger>" so a space isn't needed
				// marker todo
      	var space = (this._getActiveTrigger().length === 0 && this._getWithoutActiveToken() !== '') ? ' ' : '';

        this.input.setQuery(this._getWithoutActiveToken() + this._getActiveTrigger() + space + data.val, true);

        this.eventBus.trigger('select', data.obj);
        this.close();

        // return true if selection succeeded
        return true;
      }

      return false;
    },

    autocomplete: function autocomplete($selectable) {
      var query, data, isValid;
      query = this._getActiveToken();

      data = this.menu.getSelectableData($selectable);
      isValid = data && query !== data.val;

      if (isValid && !this.eventBus.before('autocomplete', data.obj)) {
        // if the trigger is blank and the input contains text, then add a space. otherwise, the input
        // will contain "some text <trigger>" so a space isn't needed
      	var space = (this._getActiveTrigger().length === 0 && this._getWithoutActiveToken() !== '') ? ' ' : '';

      	this.input.setQuery(this._getWithoutActiveToken() + this._getActiveTrigger() + space + data.val);
        this.eventBus.trigger('autocomplete', data.obj);

        // return true if autocompletion succeeded
        return true;
      }

      return false;
    },

    moveCursor: function moveCursor(delta) {
      var query, $candidate, data, payload, cancelMove;

      
      query = this._getActiveToken();

      $candidate = this.menu.selectableRelativeToCursor(delta);
      data = this.menu.getSelectableData($candidate);
      payload = data ? data.obj : null;

      // update will return true when it's a new query and new suggestions
      // need to be fetched – in this case we don't want to move the cursor
      cancelMove = this._minLengthMet() && this.menu.update(query);

      if (!cancelMove && !this.eventBus.before('cursorchange', payload)) {
        this.menu.setCursor($candidate);

        // cursor moved to different selectable
        if (data) {
          // if the trigger is blank and the input contains text, then add a space. otherwise, the input
          // will contain "some text <trigger>" so a space isn't needed
        	var space = (this._getActiveTrigger().length === 0 && this._getWithoutActiveToken() !== '') ? ' ' : '';
        	this.input.setInputValue(this._getWithoutActiveToken() + this._getActiveTrigger() + data.val);
        }

        // cursor moved off of selectables, back to input
        else {
          this.input.resetInputValue();
          this._updateHint();
        }

        this.eventBus.trigger('cursorchange', payload);

        // return true if move succeeded
        return true;
      }

      return false;
    },

    destroy: function destroy() {
      this.input.destroy();
      this.menu.destroy();
    }
  });

  return Typeahead;

  // helper functions
  // ----------------

  function c(ctx) {
    var methods = [].slice.call(arguments, 1);

    return function() {
      var args = [].slice.call(arguments);

      _.each(methods, function(method) {
        return ctx[method].apply(ctx, args);
      });
    };
  }
})();
