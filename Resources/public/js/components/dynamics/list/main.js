/**
 * Generated by https://github.com/alexander-schranz/sulu-backend-bundle.
 */

define(['jquery'], function ($) {
    'use strict';

    var constants = {
        toolbarId: 'dynamic-toolbar',
        toolbarKey: 'dynamics',
        listId: 'dynamic-list',
        endPointUrl: '/admin/api/form/dynamics',
        fieldsAction: '/admin/api/form/dynamics/fields'
    };

    return {

        layout: function() {
            return {
                extendExisting: true,
                content: {
                    width: this.options.width ? this.options.width : 'fixed',
                    leftSpace: true,
                    rightSpace: true
                }
            };
        },

        initialize: function() {
            this.render();
            this.initPreview();
        },

        /**
         * Initilize the sulu preview
         */
        initPreview: function() {
            this.sandbox.emit('sulu.preview.initialize', null, true);
        },

        /**
         * Get filter parameters for dynamics.
         */
        getUrlParameters: function() {
            var parameters = {
                'form': this.getFormDataProperty(this.options.property),
                'webspaceKey': this.options.webspace,
                'locale': this.options.language,
                'view': this.options.view,
                'sortBy': 'created',
                'sortOrder': 'desc'
            };

            if (this.options.type) {
                // Only set typeId when type is set!
                parameters.type = this.options.type;
                parameters.typeId = this.getFormDataProperty('id');
            }

            return parameters;
        },

        /**
         * Get form data property.
         */
        getFormDataProperty: function(property) {
            var formData = this.getFormData();

            if (!formData && typeof formData[property] === 'undefined') {
                // No property was found
                return;
            }

            return formData[property];
        },

        /**
         * Get form data.
         */
        getFormData: function() {
            var formData = null;

            if (typeof this.options.data === 'function') {
                formData = this.options.data();
            } else if (typeof this.options.data === 'object') {
                formData = this.options.data;
            } else if (typeof this.options !== 'undefined') {
                formData = this.options;
            }

            if (!formData) {
                return;
            }

            if (this.options.page > 1) {
                if (formData._embedded === 'undefined' || typeof formData._embedded.pages === 'undefined') {
                    // No page was found.
                    return;
                }

                formData = formData._embedded.pages[this.options.page - 2];
            }

            return formData;
        },

        /**
         * Renders the component
         */
        render: function () {
            this.sandbox.dom.html(this.$el,
                '<div id="' + constants.toolbarId + '"></div>' +
                '<div id="' + constants.listId + '"></div>'
            );

            var urlParameters = this.getUrlParameters();

            if (!urlParameters.form) {
                $('#' + constants.listId).html('<h3>' + app.sandbox.translate('select.no-choice') + '</h3>');
                // No form set in content.

                return;
            }

            var queryString = '?' + $.param(urlParameters);

            // init list-toolbar and datagrid
            this.sandbox.sulu.initListToolbarAndList.call(
                this,
                constants.toolbarKey,
                constants.fieldsAction + queryString,
                {
                    // options for the header (list-toolbar)
                    el: this.$find('#' + constants.toolbarId),
                    template:  this.sandbox.sulu.buttons.get({
                        settings: {
                            options: {
                                id: 'settings',
                                dropdownItems: {
                                    export: {
                                        options: {
                                            title: 'public.export',
                                            icon: 'download',
                                            callback: function() {
                                                var $container = $('<div/>');
                                                $('body').append($container);

                                                var csvOptions = {
                                                    el: $container,
                                                    urlParameter: urlParameters,
                                                    url: constants.endPointUrl + '.csv'
                                                };

                                                App.start([{
                                                    name: 'csv-export@suluform',
                                                    options: csvOptions
                                                }]).fail(function() {
                                                    // Fallback to old version of csv-export
                                                    // aura_1: Error loading component: csv-export@suluform Error: Script error for: __component__$csv-export@suluform
                                                    console.warn('Ignore error! For date-range specific export at least Sulu 1.5 is needed. Automatic fallback to default export.');

                                                    App.start([{
                                                        name: 'csv-export@suluadmin',
                                                        options: csvOptions
                                                    }])
                                                });
                                            }.bind(this)
                                        }
                                    },
                                    columnOptions: {
                                        options: {
                                            type: 'columnOptions'
                                        }
                                    }
                                }
                            }
                        }
                    }),
                    instanceName: this.instanceName
                },
                {
                    // options for the content (datagrid)
                    el: this.$find('#' + constants.listId),
                    instanceName: this.instanceName,
                    url: constants.endPointUrl + queryString,
                    resultKey: 'dynamics',
                    searchFields: ['id', 'email', 'firstName', 'lastName'],
                    viewOptions: {
                        table: {
                            selectItem: false,
                            fullWidth: true
                        }
                    }
                }
            );
        }
    };
});
