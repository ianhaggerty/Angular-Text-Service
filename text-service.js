/*
 * text-service.js
 * Author: Ian Haggerty - iahag001@yahoo.co.uk
 * Last Edit: 17/08/2013
 */

angular.module("textService", [])
	.factory("textService", function ($rootScope, $log) {

		/* Internal Implementation */
		var textService;
		textService = {
			language: "",
			state: "",
			textData: {},

			/* text(request) - Text request
			 * @request Absolute path to text without language appended - e.g. 'home.title'
			 */
			text: function (request) {
				return (new Function(
					"return arguments[0].textData." + request +
						((textService.language) ? ("." + textService.language) : "")
				))(textService);
			},

			/* absText(request)- Absolute text request
			 * @request Absolute path to text with language appended - e.g. 'home.title.en'
			 */
			absText: function (request) {
				return (new Function(
					"return arguments[0].textData." + request
				))(textService);
			},

			/* relText(request, cut) - Scoped text request, will search up the state heirarchy
			 * @request Relative path to text without language appended - e.g. 'title'
			 * @state State to test for textual data - defaults to the current state, used recursively
			 */
			relText: function (request, state) {
				if(state === undefined) {
					// initial call to function
					state = textService.state
				}
				try { return textService.text((state?state+".":"") + request)}
				catch(e) {
					if(!state) return "" // terminate to avoid infinite recursion
					return textService.relText(request, state.split(".")).slice(0,-1).join(".");
				}
			},

			/* stateText - request a string in the current state(e.g. stateText('title')
			 * @request - Relative path to string in current state
			 */
			stateText: function (request) {
				return (textService.state) ?
					textService.text(textService.state + "." + request) : "";
			}
		}

		// Register handler for state changes
		$rootScope.$on("$stateChangeSuccess", function (event, toState) {
			textService.state = toState.name;
		});

		/* Public API */
		var textServiceApi = {
			/* bindText - Bind the entire textual data to a new object
			 * @textData - The text data object to be bound to
			 */
			bindText: function (textData) {
				textService.textData = textData;
				$rootScope.$broadcast("textDataChange")
				return textServiceApi;
			},
			/* setText() - function to set textual data and update text directives
			 * @request The request string, e.g. 'home.title', 'home.title.en'
			 * @textData The textual data. Could be a literal string or an object with textual data
			 * @doUpdate Boolean indicating whether to update text directives. Defaults to FALSE.
			 * Example usage 1: setText('home.title.en', "Title") - set a text string without update
			 * Example usage 2: setText('home.title', {en:"Title", fr:"Maison"}, true)
			 * - set a text object with update to the page
			 */
			setText: function(request, textData, doUpdate) {
				(new Function(
					"arguments[0].textData." + request + "=arguments[1]"
				))(textService, textData)
				if(!doUpdate) $rootScope.$broadcast("textDataChange")
				return textServiceApi
			},
			/* getText() - Function returning textual data
			 * @request An absolute reference to the text
			 * Example usage: getText('home.title.en'), getText('home.title') // this returns a text object
			 */
			getText: function(request) {
				if(!request)
					return textService.textData
				else {
					return (new Function(
						"return arguments[0].textData." + request
					))(textService)
				}
			},
			/* setLanguage() - Set the current language
			 * @langauge  - The new language. e.g. "fr", "en"
			 * @doUpdate - Boolean indicating whether to update text directives, defaults to TRUE
			 * Example usage: setLanguage("fr") // change to french and update the page
			 */
			setLanguage: function (language, doUpdate) {
				textService.language = language
				$rootScope.$broadcast("languageChange")
				return textServiceApi;
			},
			getLanguage: function () {
				return textService.language;
			},
			/* update() - Requests all text directives to update themselves
			 */
			update: function() {
				$rootScope.$broadcast("textDataChange")
				return textServiceApi
			},
			/* Used by text directives */
			text: textService.text,
			absText: textService.absText,
			relText: textService.relText,
			stateText: textService.stateText
		}
		return textServiceApi
	})
	/* Text directive */
	.directive("text", function (textService) {
		return {
			restrict: "A",
			link: function (scope, element, attrs) {
				function update() {
					element.html(textService.text(attrs.text))
				}

				scope.$on("languageChange", update)
				scope.$on("textDataChange", update)

				update()
			}
		}
	})
	/* Absolute text directive */
	.directive("atext", function (textService) {
		return {
			restrict: "A",
			link: function (scope, element, attrs) {
				function update() {
					element.html(textService.absText(attrs.atext))
				}

				scope.$on("textDataChange", update)

				update()
			}
		}
	})
	/* State text directive */
	.directive("stext", function (textService) {
		return {
			restrict: "A",
			link: function (scope, element, attrs) {
				function update() {
					element.html(textService.stateText(attrs.stext))
				}

				scope.$on("languageChange", update)
				scope.$on("textDataChange", update)
				scope.$on("$stateChangeSuccess", update)

				update()
			}
		}
	})
	/* Relative text directive */
	.directive("rtext", function (textService, $log) {
		return {
			restrict: "A",
			link: function (scope, element, attrs) {
				function update(event, request) {
					element.html(textService.relText(attrs.rtext))
				}

				scope.$on("languageChange", update)
				scope.$on("textDataChange", update)
				scope.$on("$stateChangeSuccess", update)

				update()
			}
		}
	})

















