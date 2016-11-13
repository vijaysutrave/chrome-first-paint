var main = (function() {

    /* Initialise state */
    var resourceTiming,
        loadTimings,
        allTimings,
        perfData,
        allResourceTimings,
        memoryInital,
        memoryMax,
        sizeArray,
        filteredArrays = {
            scriptArray: [],
            imgArray: [],
            styleArray: []
        },
        wrapperEl = $('.chart-wrapper'),
        topTenEl = $('#chart-topTen').html(),
        pageStatsEl = $('#chart-pageStats').html(),
        noDownloadText = 'Wow! No new resource was downloaded!',
        noResourceText = 'Holy! No resource exists on page',
        noRequestsText = 'Great! No blocking resources exist on this page!';

    var renderHeader = function() {
        var template = $('#data-header').html();
        var html = Mustache.to_html(template, loadTimings);
        $('.head-info').html(html);
    };

    var renderBrokenPage = function() {
        var brokenHtml = $('#broken').html();
        $('.wrapper').html(brokenHtml);
    };

    var renderTopTen = function() {
        wrapperEl.html(topTenEl);

        var topTenRequests = resourceTiming.map(function(value) {
                var shortenedResource = value.resource.split('/').slice(-1)[0];
                if (shortenedResource.length > 10) {
                    shortenedResource = shortenedResource.substring(0, 10) + '..' +
                        (shortenedResource.split('.').slice(-1)[0] || '');
                }
                return {
                    meta: shortenedResource,
                    value: value.fetchTime.toFixed(2)
                }
            });

        /* Render Bar Chart to show to request times */
        if(topTenRequests.length) {
            new Chartist.Bar('.ct-chart', {
                labels: resourceTiming.map(function(value) {
                    return value.resource
                }),
                series: topTenRequests
            }, {
                distributeSeries: true,
                height: '400px',
                plugins: [
                    Chartist.plugins.tooltip()
                ]
            }, [
                ['screen and (min-width: 441px) and (max-width: 1440px)', {
                    showPoint: false,
                    axisX: {
                        labelInterpolationFnc: function(value) {
                            var name = value.split('/').slice(-1)[0];
                            if (name.length > 3) {
                                var extn = name.split('.')[1] || "";
                                if (extn && extn.length > 3)
                                    extn = extn.substring(0, 3);

                                name = name.substring(0, 3) + ".." + extn;
                            }
                            return name;
                        }
                    }
                }]
            ]);
        } else {
            $('.top-ten').addClass('no-requests-text').html(noRequestsText);
        }
    };

    var filterArrayByType = function(type) {
        return allTimings.filter(function(resource) {
            return resource.initiatorType === type;
        });
    };

    var allResourceTimes = function() {
        return allTimings.reduce(function(prev, cur) {
            return prev + (cur.transferSize / 1024);
        }, 0).toFixed(2);
    };

    var getResourceTimes = function(type) {
        return filteredArrays[type].reduce(function(prev, cur) {
            return prev + (cur.transferSize / 1024);
        }, 0);
    };

    var getResouceCount = function(type) {
        return filteredArrays[type].length;
    };

    var totalTimeTaken = function() {
        return sizeArray.reduce(function(prev, sizeObj) {
            return prev + sizeObj.size;
        }, 0);
    };

    var totalResources = function() {
        return sizeArray.reduce(function(prev, cur) {
            return prev + cur.count;
        }, 0);
    };

    var renderPageStats = function() {

        allResourceTimings = allResourceTimings || allResourceTimes();
        var otherStats = {
            data: {
                totalSize: allResourceTimings,
                totalResources: allTimings.length,
                totalMemory: (memoryInitial / memoryMax * 100).toFixed(2) + ' %',
                totalTimeOpen: ((new Date().getTime() - perfData.loadEventEnd) / 1000).toFixed(1) + ' secs'
            }
        }
        var html = Mustache.to_html(pageStatsEl, otherStats);
        wrapperEl.html(html);

        /* Array to hold all pie chart info */
        sizeArray = [{
            name: 'Images',
            size: getResourceTimes('imgArray'),
            count: getResouceCount('imgArray')
        }, {
            name: 'Scripts',
            size: getResourceTimes('scriptArray'),
            count: getResouceCount('scriptArray')
        }, {
            name: 'Stylesheets',
            size: getResourceTimes('styleArray'),
            count: getResouceCount('styleArray')
        }];

        var dataSize = {
            series: []
        };

        var dataCount = {
            series: sizeArray.map(function(resource) {
                return {
                    value: resource.count,
                    meta: resource.name
                }
            })
        };

        sizeArray.forEach(function(sizeObj) {
            if (sizeObj.size) {
                dataSize.series.push({
                    meta: sizeObj.name,
                    value: sizeObj.size.toFixed(2)
                });
            }
        });


        if (dataSize.series.length) {
            new Chartist.Pie('.ct-size-pie', dataSize, {
                labelInterpolationFnc: function(value, series) {
                    return value + ' (' + ((data.series[series] / totalTimeTaken()) * 100).toFixed(1) + '%) '
                },
                showLabel: false,
                height: '200px',
                labelDirection: 'explode',
                plugins: [
                    Chartist.plugins.tooltip()
                ]
            });
        } else {
            $('.ct-size-pie').addClass('no-download-text').html(noDownloadText);
        }

        if (dataCount.series.length) {
            new Chartist.Pie('.ct-number-pie', dataCount, {
                labelInterpolationFnc: function(value, series) {
                    return value + ' (' + ((data.series[series] / totalResources()) * 100).toFixed(1) + '%) '
                },
                showLabel: false,
                height: '200px',
                labelDirection: 'explode',
                plugins: [
                    Chartist.plugins.tooltip()
                ]
            });
        } else {
            $('.ct-number-pie').addClass('no-resource-text').html(noResourceText);
        }
    };

    var render = {
        header: renderHeader,
        topTen: renderTopTen,
        stats: renderPageStats
    };

    var tabChange = function(e) {
        $('.nav-item').removeClass('selected');
        $(e.target).addClass('selected');
        var getViewToRender = $(e.target).attr('render');
         _gaq.push(['_trackEvent', getViewToRender, 'clicked']);
        render[getViewToRender]();
    };

    var addPageEventListeners = function() {
        document.getElementById('main-navigation').addEventListener('click', tabChange, false);
    };


    var init = function() {
        chrome.tabs.getSelected(null, function(tab) {
            chrome.storage.local.get('loadTimes', function(data) {
                try {

                    addPageEventListeners();

                    var tabPerformance = data.loadTimes['tab' + tab.id],
                        paints = tabPerformance.chromeData,
                        resources = tabPerformance.resources;

                    perfData = tabPerformance.pageLoad,
                    memoryInitial = tabPerformance.memoryInitial,
                    memoryMax = tabPerformance.memoryMax;
                    allTimings = resources;

                    filteredArrays.scriptArray = filterArrayByType('script'),
                    filteredArrays.imgArray = filterArrayByType('img'),
                    filteredArrays.styleArray = filterArrayByType('link');

                    resourceTiming = resources.filter(function(value) {
                            return value.initiatorType !== 'img' && value.initiatorType !== 'xmlhttprequest';
                        }).map(function(value, key) {
                            return {
                                fetchTime: value.duration,
                                resource: value.name,
                                type: value.initiatorType,
                                size: value.transferSize
                            }
                        }).sort(function(a, b) {
                            if (a.fetchTime > b.fetchTime) {
                                return -1;
                            } else {
                                return 1
                            }
                        })
                        .splice(0, 10);

                    /* All the math required */
                    var contentLoaded = perfData.domContentLoadedEventEnd - perfData.fetchStart,
                        onLoad = perfData.loadEventStart - perfData.navigationStart,
                        firstPaint = (paints.firstPaintTime * 1000) - perfData.navigationStart;

                    loadTimings = {
                        data: {
                            "contentLoaded": contentLoaded,
                            "onLoad": onLoad,
                            "firstPaint": firstPaint
                        }
                    };

                    /* render header */ 
                    renderHeader(loadTimings)

                    /* call top ten */
                    renderTopTen(resourceTiming);

                } catch (e) {
                    console.log(e);
                    renderBrokenPage();
                }
            });
        });
    };

    return {
        init: init
    }

})();

/* Load the awesome! */
main.init();
