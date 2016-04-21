'use strict';

//jslint browser: true
//global console, $, Tour
/**
 * Bootstrap-tour module.
 * @external bootstrap-tour
 * @external jquery
 * @module
 * @return {Object} Public functions and variables
 * @see {@link https://github.com/sorich87/bootstrap-tour}
 */
var tourModule = function () {
    'use strict';

    var tour;
    $(function () {
        var $start = $('.start-tour');
        $start.removeClass('hidden');
        var steps = [{
            element: '#main-nav a[href="#editor_pane"]',
            title: 'Ready to start?',
            content: 'Go to the editor tab to extract city names and edit your roadbook.',
            placement: 'bottom',
            orphan: true,
            onShow: function onShow() {
                $('a[href="#home_pane"]').tab('show');
            }
        }, {
            element: '#map',
            title: 'The map',
            content: 'The map allow you to extract city names by clicking on you waypoints. Drag it up to your starting point.',
            placement: 'right',
            onShow: function onShow() {
                $('a[href="#editor_pane"]').tab('show');
            }
        }, {
            element: '.ol-zoom',
            title: 'Zoom ',
            content: 'Zoom until you can see the smallest city on your way then click on each one up to your last destination.',
            placement: 'right',
            onShow: function onShow() {}
        }, {
            element: '#editor',
            title: 'Freely edit your roadbook',
            content: 'The city names will be inserted in the edition area at the cursor position. Move the cursor if you forgot a city or edit the text if it\'s not like expected.',
            placement: 'left'
        }, {
            element: '.layer-switcher',
            title: 'Switch layers',
            content: 'You can change the base map and activate optional overlays like bike roads or hiking paths.',
            placement: 'right',
            onShow: function onShow() {
                $('.layer-switcher').trigger('mouseenter');
            }
        }, {
            element: '#print_roadbook',
            title: 'Print your roadbook',
            content: 'When you end editing your roadbook, just click this button to print it to your prefered format. You can also just copy the text and save it in a text file.',
            placement: 'bottom',
            onShow: function onShow() {
                $('a[href="#editor_pane"]').tab('show');
            }
        }, {
            element: '.addthis_sharing_toolbox',
            title: 'Tell the world',
            content: 'Don\'t forget to tell your friends about this cool application ;).',
            placement: 'bottom',
            onShow: function onShow() {
                $('a[href="#editor_pane"]').tab('show');
            }
        }, {
            element: '#main-nav a[href="#settings_pane"]',
            title: 'The settings',
            content: 'The settings tab allow you to customize picker output, select a GPS track file or reset the application.',
            placement: 'bottom',
            onShow: function onShow() {
                //$('a[href="#settings_pane"]').first().tab('show');
            }
        }, {
            element: '#gpx_file_path',
            title: 'Visualize your route',
            content: 'Do you have a GPS track file of your initerary? Go to the settings tab, select a .gpx file on your computer then activate the layer to visualize your route.',
            placement: 'bottom'
        }, {
            element: '#separator',
            title: 'City name separator',
            content: 'You can change the string to append after each city insertion. Enter a line break if you want to have a columned list.',
            placement: 'right'
        } /*, {
             element: '#disable_all_priorities',
             title: 'Disable some priorities',
             content: 'You can also highlight several items before using this buttons to disable the priorities you don\'t need.',
             placement: 'right'
          }, {
             element: 'div[data-anchor="priorities"] .fp-controlArrow.fp-next',
             title: 'Next step',
             content: 'Now slide to the next settings using the arrow.',
             placement: 'left',
             reflex: true
          }, {
             element: '#disabled_priorities',
             title: 'Disabled priorities',
             content: 'Here are disabled priorities. Highlight some and click the enable selection button to activate them.',
             placement: 'top',
             onShow: function () {
                 'use strict';
                 $('#fullpage').fullpage.moveTo('priorities', 'disabled_priorities');
             }
          }, {
             element: '#refresh_profile',
             title: 'Prefill your profile',
             content: 'Now select your usual place of living then click the button to prefill or reset all fields of your profile.',
             placement: 'bottom',
             reflex: true,
             onShow: function () {
                 'use strict';
                 $('#fullpage').fullpage.moveTo('user', 'profile');
             }
          }, {
             element: '#profile_form fieldset:nth-of-type(2)',
             title: 'Fill out your profil',
             content: 'Complete each field up to the last step to describe your usual lifestyle.' + ' Note that required fields vary depending on selected priorities, so you\'d better fill all fields.',
             placement: 'left',
             onShow: function () {
                 'use strict';
                 $('#fullpage').fullpage.moveTo('user', 'legal');
             }
          }, {
             title: 'Get your destinations',
             content: 'Now it\'s time to scroll the page on step down to get your destinations.',
             orphan: true
          }, {
             element: '#country_list_container li:nth-of-type(1) .show-dialog',
             title: 'Top destinations',
             content: 'Here his the list of the best destinations sorted by score. Click on the country' + ' name (or on the map) to display informations about this country.',
             placement: 'top',
             orphan: true,
             onShow: function () {
                 'use strict';
                 $('#fullpage').fullpage.moveTo('results', 'country_list');
             }
          }, {
             element: '#matches-tab',
             title: 'Country details',
             content: 'Here you will find matching priorities. Go through each tabs to find a lot of useful' + ' informations about this country.',
             placement: 'right',
             onShow: function () {
                 'use strict';
                 if (!$('.ui-dialog').is(':visible')) {
                     //$('#country_list_container').find('li:nth-of-type(1) .show-dialog').click();
                     $('#country_list_container').find('.show-dialog').click();
                 }
             },
             onHide: function () {
                 'use strict';
                 if ($('.ui-dialog-content')) {
                     $('.ui-dialog-content').dialog('close');
                 }
             }
          }, {
             element: '#geochart_container',
             title: 'The map',
             content: 'The map show you the best destinations in a more visual way. The more countries are' + ' colored, the more they match your priorities.',
             placement: 'top',
             reflex: true,
             onShow: function () {
                 'use strict';
                 $('#fullpage').fullpage.moveTo('results', 'map');
             }
          }, {
             element: '#geochart_region',
             title: 'Zoom in / out',
             content: 'You can focus on a specific region using this select box. Choose "World" to zoom' + ' out.',
             placement: 'left',
             reflex: true
          }, {
             title: 'Have fun!',
             content: 'Now it\'s your turn. Have a look in the FAQ if you have any questions.',
             placement: 'top',
             orphan: true,
             onShow: function () {
                 'use strict';
                 $('#fullpage').fullpage.moveTo('priorities', 'enabled_priorities');
             }
          }*/
        ];
        tour = new Tour({
            //duration: 10000,
            orphan: true,
            steps: steps,
            onStart: function onStart() {
                if ($start) $start.addClass('disabled');
            },
            onEnd: function onEnd() {
                if ($start) $start.removeClass('disabled');
            },
            onShow: function onShow() {
                if ($start) $start.addClass('disabled');
            },
            onHide: function onHide() {
                if ($start) $start.removeClass('disabled');
            },
            onPause: function onPause() {
                if ($start) $start.removeClass('disabled');
            }
        });
        tour.init();
        console.log('Tour initialized');
        $start.on('click', function (e) {
            console.log('Start tour');
            tour.start(true);
        });
    });

    return {};
}();
//# sourceMappingURL=tourModule.js.map
