//======================================================================================================================
//	Utility
//======================================================================================================================
(function(e) {
	// Initializing cross browser selector matches
	if (!e.matches)
		e.matches = e.matchesSelector || e.webkitMatchesSelector || e.mozMatchesSelector || e.msMatchesSelector || e.oMatchesSelector;
})(Element.prototype);

function bindEvent(node, eventName, selector, handler) {
	if (typeof selector == 'function') {
		handler = selector;
		selector = null;
	}

	node.addEventListener(eventName, function(event) {
		if (!selector || event.target.matches(selector))
			handler(event);
	});
}

function nodeOffset(node) {
	var left, top;
	
	if (node.getBoundingClientRect) {
		var rect = node.getBoundingClientRect();
		left = Math.floor(rect.left);
		top = Math.floor(rect.top);
	}
	else {
		left = 0;
		top = 0;
		while (node) {
			left += node.offsetLeft;
			top += node.offsetTop;
			node = node.offsetParent;
		}
	}
	return {
		'left': left,
		'top': top
	};
}

function ensureRange(value, minValue, maxValue) {
	if (value < minValue)
		return minValue;
	if (value > maxValue)
		return maxValue;
	return value;
}
//======================================================================================================================
//	END OF: Utility
//======================================================================================================================

//======================================================================================================================
//	Inverse Circles Game
//======================================================================================================================
var INVERSE_CIRCLES_GAME = {};
(function(plugin) {
	var node;
	var mapNode;
	var infoNode;
	var map;
	var canvas;
	var ctx;
	var selectedX = 2;
	var selectedY = 2;
	var mapComplexity = 3;

	function init() {
		node = document.getElementsByClassName('ic-inverse-circles-game')[0];
		mapNode = node.getElementsByClassName('ic-inverse-circles-game-map')[0];
		infoNode = node.getElementsByClassName('ic-inverse-circles-game-info-block')[0];
		canvas = node.getElementsByClassName('ic-inverse-circles-game-map-canvas')[0];
		ctx = canvas.getContext('2d');

		adjust();
		generateMap();

		// Processing window resize event
		bindEvent(window, 'resize', function() {
			adjust();
			repaint();
		});

		// Processing keydown event
		bindEvent(document.body, 'keydown', function(event) {
			KEYBOARD_SHORTCUTS_SCREEN.close();
			NEW_GAME_SCREEN.close();

			// Processing click on F1 key
			if (event.keyCode == 112) {
				event.preventDefault();
				KEYBOARD_SHORTCUTS_SCREEN.display();
				return;
			}

			// Processing click on F2 key
			if (event.keyCode == 113) {
				event.preventDefault();
				NEW_GAME_SCREEN.display();
				return;
			}

			// Processing click on UP ARROW key
			if (event.keyCode == 38) {
				event.preventDefault();
				selectedY = (selectedY + 4) % 5;
				repaint();
				return;
			}

			// Processing click on DOWN ARROW key
			if (event.keyCode == 40) {
				event.preventDefault();
				selectedY = (selectedY + 1) % 5;
				repaint();
				return;
			}

			// Processing click on LEFT ARROW key
			if (event.keyCode == 37) {
				event.preventDefault();
				selectedX = (selectedX + 4) % 5;
				repaint();
				return;
			}

			// Processing click on RIGHT ARROW key
			if (event.keyCode == 39) {
				event.preventDefault();
				selectedX = (selectedX + 1) % 5;
				repaint();
				return;
			}

			// Processing click on ENTER key
			if (event.keyCode == 13) {
				event.preventDefault();
				toggle(selectedX, selectedY);
				return;
			}

			// Processing click on SPACE key
			if (event.keyCode == 32) {
				event.preventDefault();
				toggle(selectedX, selectedY);
				return;
			}

			// Processing click on '1' key
			if (event.keyCode == 49) {
				event.preventDefault();
				mapComplexity = 3;
				generateMap();
				return;
			}

			// Processing click on '2' key
			if (event.keyCode == 50) {
				event.preventDefault();
				mapComplexity = 5;
				generateMap();
				return;
			}

			// Processing click on '3' key
			if (event.keyCode == 51) {
				event.preventDefault();
				mapComplexity = 7;
				generateMap();
				return;
			}

			// Processing click on '4' key
			if (event.keyCode == 52) {
				event.preventDefault();
				mapComplexity = 9;
				generateMap();
			}
		});

		// Processing canvas mouse move event
		bindEvent(canvas, 'mousemove', function(event) {
			var mapOffset = nodeOffset(mapNode);
			var step = canvas.width / 5;
			var newSelectedX = ensureRange(Math.floor((event.pageX - mapOffset.left) / step), 0, 4);
			var newSelectedY = ensureRange(Math.floor((event.pageY - mapOffset.top) / step), 0, 4);

			if (newSelectedX != selectedX || newSelectedY != selectedY) {
				selectedX = newSelectedX;
				selectedY = newSelectedY;
				repaint();
			}
		});

		// Processing canvas mouse down event
		bindEvent(canvas, 'mousedown', function() {
			toggle(selectedX, selectedY);
		});

		// Processing click on 'F1 - Keybord shortcuts' button
		bindEvent(node, 'click', '.ic-inverse-circles-game-info-block-keyborad-shortcuts-button', function() {
			KEYBOARD_SHORTCUTS_SCREEN.display();
		});

		// Processing click on 'F2 - New game' button
		bindEvent(node, 'click', '.ic-inverse-circles-game-info-block-new-game-button', function(event) {
			NEW_GAME_SCREEN.display();
		});
	}

	function generateMap() {
		var i, j;

		map = [];
		for (j = 0; j < 5; j++) {
			var row = [];
			for (i = 0; i < 5; i++)
				row.push(0);
			map.push(row);
		}

		for (i = 0; i < mapComplexity; i++) {
			var x = Math.floor(Math.random() * 5);
			var y = Math.floor(Math.random() * 5);
			toggleItem(x, y);
		}

		repaint();
	}

	function toggleItem(x, y) {
		map[y][x] = 1 - map[y][x];
		if (x > 0)
			map[y][x - 1] = 1 - map[y][x - 1];
		if (x < 4)
			map[y][x + 1] = 1 - map[y][x + 1];
		if (y > 0)
			map[y - 1][x] = 1 - map[y - 1][x];
		if (y < 4)
			map[y + 1][x] = 1 - map[y + 1][x];
	}

	function toggle(x, y) {
		toggleItem(x, y);

		var completed = true;
		for (var j = 0; j < 5; j++) {
			for (var i = 0; i < 5; i++) {
				if (map[j][i] > 0)
					completed = false;
			}
		}
		if (completed)
			NEW_GAME_SCREEN.display();

		repaint();
	}

	function adjust() {
		var mapCellSize = Math.min(window.innerWidth, window.innerHeight - 2 * infoNode.offsetHeight) / 5;

		// Adjusting cell size
		if (mapCellSize > 64)
			mapCellSize = 64;

		// Setting map size
		var mapSize = mapCellSize * 5;
		canvas.width = mapSize;
		canvas.height = mapSize;

		// Setting map position to the center of the screen
		var x = (window.innerWidth - mapSize) / 2;
		var y = (window.innerHeight - mapSize) / 2;

		mapNode.style.left = x + 'px';
		mapNode.style.top = y + 'px';
	}

	function repaint() {
		ctx.clearRect(0, 0, canvas.width, canvas.height);

		var step = canvas.width / 5;
		ctx.lineWidth = step / 15;
		for (var j = 0; j < 5; j++) {
			for (var i = 0; i < 5; i++) {
				ctx.beginPath();
				ctx.arc(i * step + step / 2, j * step + step / 2, step / 3, 0, 2 * Math.PI, false);

				ctx.strokeStyle = (i == selectedX && j == selectedY) ? "#ffffff" : "#212121";
				ctx.fillStyle = (map[j][i] > 0) ? "#8e94ff" : "#000000";

				ctx.fill();
				ctx.stroke();
			}
		}
	}

	function setMapComplexity(value) {
		mapComplexity = value;
	}

	plugin.init = init;
	plugin.setMapComplexity = setMapComplexity;
	plugin.generateMap = generateMap;
})(INVERSE_CIRCLES_GAME);
//======================================================================================================================
//	END OF: Inverse Circles Game
//======================================================================================================================

//======================================================================================================================
//	Keyboard Shortcuts Screen
//======================================================================================================================
var KEYBOARD_SHORTCUTS_SCREEN = {};
(function(plugin) {
	var initialized = false;
	var visible = false;
	var node;
	var contentNode;

	function init() {
		if (initialized)
			return;

		node = document.getElementsByClassName('ic-keyboard-shortcuts-screen')[0];
		contentNode = node.getElementsByClassName('ic-keyboard-shortcuts-screen-content')[0];

		// Processing window resize
		bindEvent(window, 'resize', adjust);
		
		// Processing click event
		bindEvent(node, 'click', function() {
			close();
		});
	}

	function display() {
		init();
		node.style.display = 'block';
		visible = true;
		adjust();
	}

	function close() {
		if (!visible)
			return;

		node.style.display = 'none';
		visible = false;
	}

	function adjust() {
		var x = (window.innerWidth - contentNode.offsetWidth) / 2;
		var y = (window.innerHeight - contentNode.offsetHeight) / 2;

		if (x < 0)
			x = 0;
		if (y < 0)
			y = 0;

		contentNode.style.left = x + 'px';
		contentNode.style.top = y + 'px';
	}

	plugin.display = display;
	plugin.close = close;
})(KEYBOARD_SHORTCUTS_SCREEN);
//======================================================================================================================
//	END OF: Keyboard Shortcuts Screen
//======================================================================================================================

//======================================================================================================================
//	New Game Screen
//======================================================================================================================
var NEW_GAME_SCREEN = {};
(function(plugin) {
	var initialized = false;
	var visible = false;
	var node;
	var contentNode;
	
	function init() {
		if (initialized)
			return;

		node = document.getElementsByClassName('ic-new-game-screen')[0];
		contentNode = node.getElementsByClassName('ic-new-game-screen-content')[0];

		// Processing window resize
		bindEvent(window, 'resize', adjust);
		
		// Processing click event on '1. Easy'
		bindEvent(node, 'click', '.ic-new-game-screen-easy-button', function() {
			INVERSE_CIRCLES_GAME.setMapComplexity(3);
			close();
		});

		// Processing click event on '2. Medium'
		bindEvent(node, 'click', '.ic-new-game-screen-medium-button', function() {
			INVERSE_CIRCLES_GAME.setMapComplexity(5);
			close();
		});

		// Processing click event on '3. Hard'
		bindEvent(node, 'click', '.ic-new-game-screen-hard-button', function() {
			INVERSE_CIRCLES_GAME.setMapComplexity(7);
			close();
		});

		// Processing click event on '4. Extra hard'
		bindEvent(node, 'click', '.ic-new-game-screen-extra-hard-button', function() {
			INVERSE_CIRCLES_GAME.setMapComplexity(9);
			close();
		});

		initialized = true;
	}
	
	function display() {
		init();
		node.style.display = 'block';
		visible = true;
		adjust();
	}

	function close() {
		if (!visible)
			return;

		node.style.display = 'none';
		visible = false;
		INVERSE_CIRCLES_GAME.generateMap();
	}

	function adjust() {
		var x = (window.innerWidth - contentNode.offsetWidth) / 2;
		var y = (window.innerHeight - contentNode.offsetHeight) / 2;

		if (x < 0)
			x = 0;
		if (y < 0)
			y = 0;

		contentNode.style.left = x + 'px';
		contentNode.style.top = y + 'px';
	}
	
	plugin.display = display;
	plugin.close = close;
})(NEW_GAME_SCREEN);
//======================================================================================================================
//	END OF: New Game Screen
//======================================================================================================================