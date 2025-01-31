/**
 * Created by Ramez on 11/20/14.
 */
(function ($) {

        function dataArrayToObject(data, key) {
            // Turn a data array to an object
            // Example:
            // in: [
            // {'key': key , 'value': 0},
            // {'key': key , 'value': 1},
            // {'key': key , 'value': 2},
            // ]
            // out: {'key':key , 'value':[0,1,2]}
            var output = {};
            for (var r = 0; r < data.length; r++) {
                output[data[r][key]] = data[r];
            }
            return output
        }


        let _chart_cache = {};

        function normalStackedTooltipFormatter() {

            var tooltip = '<small>' + this.x + '</small><table>' +
                '<tr><td style="color: ' + this.series.color + '">' + this.series.name + ': </td> <td style="text-align: right"><b>' + this.point.y + ' </b></td></tr>' +
                '<tr><td style="color: ' + this.series.color + '">{pertoTotal}:</td><td style="text-align: right"><b>' + this.point.percentage.toFixed(2) + ' %</b></td></tr>' +
                '<tr><td> {Total}:</td><td style="text-align: right"><b>' + this.point.stackTotal + '<b></td></tr>' +
                '</table>';
//style="color: '+ this.series.color+'"
            tooltip = tooltip.format($.slick_reporting.highcharts.defaults.messages);
            return tooltip

        }

        function transform_to_pie(chartObject_series, index, categories) {
            index = index || 0;
            let new_series_data = []
            chartObject_series.forEach(function (elem, key) {
                new_series_data.push({
                    'name': elem.name,
                    'y': elem.data[index]
                })
            })
            return {
                'name': categories[index],
                'data': new_series_data
            }
        }

        function createChartObject(response, chartOptions, extraOptions) {
            // Create the chart Object
            // First specifying the global defaults then apply teh specification from the response

            try {
                $.extend(chartOptions, {
                    'sub_title': '',
                });
                chartOptions.data = response.data;

                let is_time_series = is_timeseries_support(response, chartOptions); // response.metadata.time_series_pattern || '';
                let is_crosstab = is_crosstab_support(response, chartOptions);

                let chart_type = chartOptions.type;
                let enable3d = false;
                let chart_data = {};

                let rtl = false; // $.slick_reporting.highcharts.defaults.rtl;

                if (is_time_series) {
                    chart_data = get_time_series_data(response, chartOptions)
                } else if (is_crosstab) {
                    chart_data = get_crosstab_data(response, chartOptions)
                } else {
                    chart_data = get_normal_data(response, chartOptions)
                }


                let highchart_object = {
                    chart: {
                        type: '',
                    },
                    title: {
                        text: chartOptions.title,
                    },
                    subtitle: {
                        text: chartOptions.sub_title,
                        useHTML: Highcharts.hasBidiBug
                    },
                    yAxis: {
                        opposite: rtl,
                    },
                    xAxis: {
                        labels: {enabled: true},
                        reversed: rtl,
                    },
                    tooltip: {
                        useHTML: Highcharts.hasBidiBug
                    },
                    plotOptions: {},
                    exporting: {
                        allowHTML: true,

                        enabled: true,
                    }
                };


                highchart_object.series = chart_data.series;
                if (chart_type === 'bar' || chart_type === 'column' || chart_type === 'pie') {

                    highchart_object.chart.type = chart_type;

                    if (chart_type === 'bar' || chart_type === 'column') {
                        highchart_object['xAxis'] = {
                            categories: chart_data['titles'],
                        };
                    }
                    highchart_object['yAxis']['labels'] = {overflow: 'justify'};
                }

                if (chart_type === 'pie') {
                    highchart_object.series = [transform_to_pie(chart_data.series, 0, chart_data.categories)]
                    highchart_object.plotOptions = {
                        pie: {
                            allowPointSelect: true,
                            cursor: 'pointer',
                            dataLabels: {
                                enabled: true,
                                format: '{point.percentage:.1f}% <b>{point.name}</b>',
                            },
                            showInLegend: false, // ($(window).width() >= 1024) ,
                            style: {
                                color: (Highcharts.theme && Highcharts.theme.contrastTextColor) || 'black'
                            }
                        }
                    };

                    highchart_object['legend'] = {
                        layout: 'vertical',
                        align: 'right',
                        verticalAlign: 'top',
                        x: -40,
                        y: 100,
                        floating: true,
                        borderWidth: 1,

                        shadow: true
                    };

                    if (enable3d) {
                        highchart_object.chart.options3d = {
                            enabled: true,
                            alpha: 45,
                            beta: 0
                        };
                        highchart_object.plotOptions.pie.innerSize = 100;
                        highchart_object.plotOptions.pie.depth = 45;
                    }
                } else if (chart_type === 'column') {
                    if (enable3d) {
                        highchart_object.chart.options3d = {
                            enabled: true,
                            alpha: 10,
                            beta: 25,
                            depth: 50
                        };
                        highchart_object.plotOptions.column = {
                            depth: 25
                        };
                        highchart_object.chart.margin = 70;
                    }
                    if (chartOptions['stacking']) {
                        highchart_object.plotOptions.series = {stacking: chartOptions['stacking']};
                    }
                    if (chartOptions['tooltip_formatter']) {
                        highchart_object.tooltip = {
                            useHTML: true,
                            formatter: chartOptions['tooltip_formatter'],
                            valueDecimals: 2
                        }
                    }


                } else if (chart_type === 'area') {
                    highchart_object.chart.type = 'area';

                    highchart_object.plotOptions = {
                        area: {
                            stacking: chartOptions['stacking'] || 'normal',
                            marker: {
                                enabled: false
                            }
                        }
                    }
                } else if (chart_type === 'line') {
                    let marker_enabled = true;
                    highchart_object.chart.type = 'line';
                    // disable marker when ticks are more then 12 , relying on the hover of the mouse ;
                    try {
                        if (highchart_object.series[0].data.length > 12) marker_enabled = false;
                    } catch (err) {

                    }

                    highchart_object.plotOptions = {
                        line: {
                            marker: {
                                enabled: false
                            }
                        }
                    };
                    highchart_object.xAxis.labels.enabled = marker_enabled;

                    highchart_object.tooltip.useHTML = true;
                    highchart_object.tooltip.shared = true;
                    highchart_object.tooltip.crosshairs = true;
                }

                if (is_time_series) {
                    if (chartOptions.plot_total && chartOptions.type !== 'line') {
                        highchart_object.xAxis.categories = [chartOptions.title]
                    } else {
                        highchart_object.xAxis.categories = chart_data.titles;
                    }
                    highchart_object.xAxis.tickmarkPlacement = 'on';
                    if (chart_type !== 'line')
                        highchart_object.tooltip.shared = false //Option here;
                } else {
                    highchart_object.xAxis.categories = chart_data.titles
                }

                highchart_object.credits = $.slick_reporting.highcharts.defaults.credits;
                highchart_object.lang = {
                    noData: $.slick_reporting.highcharts.defaults.messages.noData
                };
                return highchart_object;
            } catch (err) {
                console.log(err);
            }
        }

        function get_normal_data(response, chartOptions) {
            let data_sources = {};
            let series = []
            chartOptions.data_source;
            let categories = []
            chartOptions.data_source.forEach(function (elem, key) {
                data_sources[elem] = []; //{'name': chartOptions.series_name[key],}
                response.columns.forEach(function (col, key) {
                    if (elem === col.name) {
                        data_sources[elem].push(col.name)
                        categories.push(col.verbose_name)
                    }
                })
            })

            response.data.forEach(function (elem, index) {
                series.push({
                    'name': elem[chartOptions.title_source],
                    'data': [elem[chartOptions.data_source]]
                })
            })
            return {
                'categories': categories,
                'titles': categories,
                'series': series,
            }
        }

        function get_time_series_data(response, chartOptions) {

            let series = []
            let data_sources = {};
            chartOptions.data_source.forEach(function (elem, key) {
                data_sources[elem] = [];
                response.columns.forEach(function (col, key) {
                    if (col.computation_field === elem) {
                        data_sources[elem].push(col.name)
                    }
                })
            })
            if (!chartOptions.plot_total) {
                response.data.forEach(function (elem, index) {
                    Object.keys(data_sources).forEach(function (series_cols, index) {
                        let data = []
                        data_sources[series_cols].forEach(function (col, index) {
                            data.push(elem[col])
                        })
                        series.push({
                            'name': elem[chartOptions.title_source],
                            'data': data
                        })
                    })
                })
            } else {
                let all_column_to_be_summed = []
                let data = []
                Object.keys(data_sources).forEach(function (series_cols, index) {
                    all_column_to_be_summed = all_column_to_be_summed.concat(data_sources[series_cols]);
                })
                let totalValues = $.slick_reporting.calculateTotalOnObjectArray(response.data, all_column_to_be_summed)

                Object.keys(data_sources).forEach(function (series_cols, index) {

                    data_sources[series_cols].forEach(function (col, index) {
                        data.push(totalValues[col])
                        if (chartOptions.type !== "line") {
                            series.push({
                                'name': response.metadata.time_series_column_verbose_names[index],
                                data: [totalValues[col]]
                            })
                        }
                    })

                })
                if (chartOptions.type === "line") {
                    series.push({
                        'name': chartOptions.title,
                        data: data
                    })
                }

            }
            return {
                'categories': response.metadata.time_series_column_verbose_names,
                'titles': response.metadata.time_series_column_verbose_names,
                'series': series,
            }
        }

        function get_crosstab_data(response, chartOptions) {

            let series = []
            let data_sources = {};
            let col_dict = dataArrayToObject(response.columns, 'name')
            chartOptions.data_source.forEach(function (elem, key) {
                data_sources[elem] = [];
                response.columns.forEach(function (col, key) {
                    if (col.computation_field === elem) {
                        data_sources[elem].push(col.name)
                    }
                })
            })
            if (!chartOptions.plot_total) {
                response.data.forEach(function (elem, index) {
                    Object.keys(data_sources).forEach(function (series_cols, index) {
                        let data = []
                        data_sources[series_cols].forEach(function (col, index) {
                            data.push(elem[col])
                        })
                        series.push({
                            'name': elem[chartOptions.title_source],
                            'data': data
                        })
                    })
                })
            } else {
                let all_column_to_be_summed = []
                Object.keys(data_sources).forEach(function (series_cols, index) {
                    all_column_to_be_summed = all_column_to_be_summed.concat(data_sources[series_cols]);
                })
                let totalValues = $.slick_reporting.calculateTotalOnObjectArray(response.data, all_column_to_be_summed)

                Object.keys(data_sources).forEach(function (series_cols, index) {
                    data_sources[series_cols].forEach(function (col, index) {
                        series.push({
                            'name': col_dict[col].verbose_name,
                            'data': [totalValues[col]]
                        })
                    })
                })
            }
            return {
                'categories': response.metadata.crosstab_column_verbose_names,
                'titles': response.metadata.crosstab_column_verbose_names,
                'series': series,
            }
        }


        function is_timeseries_support(response, chartOptions) {
            if (chartOptions.time_series_support === false) return false;
            return response.metadata.time_series_pattern || ''
        }

        function is_crosstab_support(response, chartOptions) {
            return response.metadata.crosstab_model || ''
        }

        function displayChart(data, $elem, chartOptions) {
            if ($elem.find("div[data-inner-chart-container]").length === 0) {
                $elem.append('<div data-inner-chart-container style="width:100%; height:400px;"></div>')
            }

            let chart = $elem.find("div[data-inner-chart-container]")

            let cache_key = $.slick_reporting.get_xpath($elem) + ":" + data.report_slug + ':' + chartOptions.id;
            try {
                let existing_chart = _chart_cache[cache_key];
                if (typeof (existing_chart) !== 'undefined') {
                    existing_chart.highcharts().destroy()
                }
            } catch (e) {
                console.error(e)
            }

            let chartObject = $.slick_reporting.highcharts.createChartObject(data, chartOptions);
            _chart_cache[cache_key] = chart.highcharts(chartObject);

        }

        $.slick_reporting.highcharts = {
            createChartObject: createChartObject,
            displayChart: displayChart,
            defaults: {
                normalStackedTooltipFormatter: normalStackedTooltipFormatter,
                messages: {
                    noData: 'No Data to display ... :-/',
                    total: 'Total',
                    percent: 'Percent',
                },
                credits: {
                    // text: '',
                    // href: ''
                },
                enable3d: false,
            }
        };
    }

    (jQuery)
);