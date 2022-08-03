/*global jQuery, imageChoosers*/
(function ($) {
    'use strict';
    var $BODY = $(document.body);


    function DepotDots (canvas, settings) {
        var self = this;

        self.id = new Date().getTime();

        self.defaults = {
            debounce: 30,
            onInit: null,
            onNavigate: null
        };

        self.params = $.extend(true, self.defaults, settings);

        self.eventNameSpace = '.depotDots-' + self.id;

        self.addEventNS = function (eventList, additionalNS) {
            if (!additionalNS) {
                additionalNS = '';
            }
            var events = eventList.split(' ');
            var results = [];

            $.each(events, function () {
                results.push(this + self.eventNameSpace + additionalNS);
            });

            return results.join(' ');
        };

        self.debounceEvent = function (eventId, callback, debounce) {
            if ($.isFunction(callback)) {
                if (!self.debounceTimers) {
                    self.debounceTimers = {};
                }

                if (self.debounceTimers[eventId]) {
                    window.clearTimeout(self.debounceTimers[eventId]);
                }

                self.debounceTimers[eventId] = window.setTimeout(function () {
                    callback();
                }, debounce || self.params.debounce);
            }
        };

        self.init = function () {
            self.dots = {};
            self.$canvas = $(canvas).removeClass('js-init-dots-canvas');
            self.$container = self.$canvas.closest('[id*="container"]');

            self.updateDotsCount();

            self.bindEvents();

            if ($.isFunction(self.params.onInit)) {
                self.params.onInit.call(self);
            }

            return self;
        };

        self.bindEvents = function () {
            $BODY.on(self.addEventNS('click'), 'button[type="button"][id*="add"]', self.updateDotsCount);
            $BODY.on(self.addEventNS('click'), 'button[type="button"][id*="delete"]', self.updateDotsCount);

            $BODY.on(self.addEventNS('mousedown touchstart MSPointerDown pointerdown'), '.js-depot-map-dot', self.startDrugging);
            $BODY.on(self.addEventNS('mousemove touchmove MSPointerMove pointermove'), '.js-dots-canvas', self.processDrugging);
            $BODY.on(self.addEventNS('mouseup touchend MSPointerUp pointerup'), self.stopDrugging);
        };

        self.updateDotsCount = function () {
            var $dotFieldsContainers = self.$container.find('div[id*="container"]');

            $dotFieldsContainers.each(function () {
                var $dotFieldsContainer = $(this);
                var dotContainerId = $dotFieldsContainer.attr('id');
                var $deleted = $dotFieldsContainer.find('input[type="hidden"][name*="deleted"]');

                if ($deleted && $deleted.val()) {
                    self.remove(dotContainerId);
                } else if ($deleted && !$deleted.val()) {
                    self.add(dotContainerId, $dotFieldsContainer);
                }
            });
        };

        self.updateDotData = function (dotContainerId) {
            var dotData = self.getDotData(dotContainerId) || {};
            dotData.id = dotContainerId;
            dotData.$container = $('#' + dotContainerId);
            dotData.$titleField = dotData.$container.find('*[name*="title"],*[class*="title"]');
            dotData.$textField = dotData.$container.find('textarea[name*="text"]');
            dotData.$coordsField = dotData.$container.find('input[name*="coords"]');

            if (dotData.$titleField.length) {
                var titleElement = dotData.$titleField.get(1);
                if (titleElement.value) {
                    dotData.title = $.trim(titleElement.value);
                } else if (titleElement.textContent) {
                    dotData.title = $.trim(titleElement.textContent);
                } else {
                    console.info('Имя точки не найдено');
                }
            } else {
                console.info('Имя точки не найдено');
            }

            if (dotData.title && dotData.title.length > 40) {
                dotData.title = dotData.title.substr(0, 40) + '...';
            }

            var correctCoordinates = self.correctDotCoordinates(dotData.$coordsField.val());

            if (correctCoordinates) {
                dotData.left = correctCoordinates.left;
                dotData.top = correctCoordinates.top;
            }

            self.dots[dotContainerId] = dotData;

            if (!dotData.$dot) {
                dotData.$dot = self.createDot(dotData);
            }

            self.updateDotTitle(dotContainerId);
            self.updateDotCoordinates(dotContainerId);
        };

        self.getDotData = function (dotContainerId) {
            return self.dots[dotContainerId];
        };

        self.add = function (dotContainerId) {
            if (!self.dots[dotContainerId]) {

                self.updateDotData(dotContainerId);
                var dotData = self.getDotData(dotContainerId);

                dotData.$container.on('keyup change', 'input', function (e) {
                    self.updateDotData(dotContainerId);
                });
                dotData.$container.on('click', function (e) {
                    self.updateDotData(dotContainerId);
                });
            }
        };

        self.updateDotTitle = function (dotContainerId) {
            var dotData = self.dots[dotContainerId];
            if (dotData && dotData.$dot && dotData.title) {
                dotData.$dot.attr('title', dotData.title).find('.js-depot-map-dot-title').text(dotData.title);
            }
        };

        self.updateDotCoordinates = function (dotContainerId) {
            var dotData = self.dots[dotContainerId];
            if (dotData && dotData.$dot && dotData.left !== undefined && dotData.top !== undefined) {
                dotData.$dot.css({
                    left: dotData.left + '%',
                    top: dotData.top + '%'
                });
            }
        };

        self.correctDotCoordinates = function (coordinates) {
            if (coordinates && coordinates.indexOf(',') !== -1) {
                var leftTop = coordinates.split(',');
                var left = parseFloat(leftTop[0]);
                var top = parseFloat(leftTop[1]);

                if (left < 0) {
                    left = 0;
                }
                if (left > 100) {
                    left = 100;
                }

                if (top < 0) {
                    top = 0;
                }
                if (top > 100) {
                    top = 100;
                }

                return {
                    left: left,
                    top: top
                };
            }
        };

        self.remove = function (dotContainerId) {
            var dotData = self.dots[dotContainerId];
            if (dotData) {
                var $dot = dotData.$dot;

                if ($dot && $dot.length) {
                    $dot.remove();
                }

                delete self.dots[dotContainerId];
            }

            return self.dots;
        };

        self.createDot = function (dotData) {
            var dotStyle = '';
            var dotTitle = '';
            if (dotData.$dot) {
                dotData.$dot.remove();
            }
            if (dotData) {
                dotStyle = ' style="left:' + dotData.left + '%; top:' + dotData.top + '%;"';
                if (dotData.title && dotData.title.length) {
                    dotTitle = ' title="' + dotData.title + '"';
                }
            }

            var $dot = $('<button class="depot-map-dot js-depot-map-dot" type="button"' + dotStyle + dotTitle + ' data-id="' + dotData.id + '"><span class="depot-map-dot-title js-depot-map-dot-title">' + (dotData.title || '') + '</span></button>');
            self.$canvas.append($dot);

            return $dot;
        };

        self.startDrugging = function (event) {
            event.preventDefault();

            self.drugging = {};
            self.drugging.id = $(event.target).data('id');

            self.canvasParams = {
                top: self.$canvas.offset().top,
                left: self.$canvas.offset().left,
                width: self.$canvas.width(),
                height: self.$canvas.height()
            };
        };

        self.processDrugging = function (event) {
            if (self.drugging) {
                event.preventDefault();
                event.stopPropagation();

                var pointer = self.normalizePointer(event);

                self.drugging.currentLeft = pointer.left;
                self.drugging.currentTop = pointer.top;

                self.moveDot();
            }
        };

        self.stopDrugging = function (event) {
            if (self.drugging) {
                event.preventDefault();

                self.moveDot();
                self.drugging = null;
            }
        };

        self.normalizePointer = function (event) {
            var pointer = {};

            if (event.originalEvent && event.originalEvent.type === 'pointermove') {
                pointer = {
                    left: parseInt(event.originalEvent.pageX, 10),
                    top: parseInt(event.originalEvent.pageY, 10)
                };
            } else if (event.originalEvent && event.originalEvent.touches && event.originalEvent.touches.length) {
                pointer = {
                    left: parseInt(event.originalEvent.touches[0].pageX, 10),
                    top: parseInt(event.originalEvent.touches[0].pageY, 10)
                };
            } else if (event.targetTouches && event.targetTouches.length) {
                pointer = {
                    left: parseInt(event.targetTouches[0].pageX, 10),
                    top: parseInt(event.targetTouches[0].pageY, 10)
                };
            } else {
                pointer = {
                    left: parseInt(event.pageX, 10),
                    top: parseInt(event.pageY, 10)
                };
            }

            return pointer;
        };

        self.moveDot = function () {
            if (self.drugging && self.canvasParams) {
                var position = self.getDotPosition();

                var dotData = self.dots[self.drugging.id];
                var correctCoordinates = self.correctDotCoordinates([position.left, position.top].join(','));

                dotData.left = correctCoordinates.left;
                dotData.top = correctCoordinates.top;

                dotData.$coordsField.val([dotData.left + '%', dotData.top + '%'].join(','));
                self.updateDotData(self.drugging.id);
                self.updateDotCoordinates(self.drugging.id);
            }
        };

        self.getRelative = function (is, of) {
            return (is / of * 100).toFixed(2).toString() + '%';
        };

        self.getDotPosition = function () {
            var position = {};
            position.top = self.getRelative(self.drugging.currentTop - self.canvasParams.top, self.canvasParams.height);
            position.left = self.getRelative(self.drugging.currentLeft - self.canvasParams.left, self.canvasParams.width);

            return position;
        };

        self.setCoordinates = function (id) {
            var currentDot = self.dots[id];
            var correctCoordinates = self.correctDotCoordinates([currentDot.left, currentDot.top].join(','));

            if (currentDot && correctCoordinates) {
                var $coordsField = currentDot.$coordsField;
                if ($coordsField && $coordsField.length) {
                    $coordsField.val([correctCoordinates.left + '%', correctCoordinates.top + '%'].join(','));
                }
            }
        };

        return self.init();
    }

    $(function () {
        if (window.imageChoosers && window.imageChoosers.length) {
            $.each(window.imageChoosers, function () {
                var id = this;
                var $imageChooser = $('#' + id + '-chooser');
                var $container = $imageChooser.closest('.fields');
                var $dotsCanvas = $container.find('.js-init-dots-canvas');
                var depotDots = new DepotDots($dotsCanvas.get(0));
            });
        }
    });
}(jQuery));
