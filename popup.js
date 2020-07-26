var CDNCacheFront = {

    init: function() {

        setInterval(CDNCacheFront.isReachable, 1000);
        CDNCacheFront.isReachable();

        chrome.storage.sync.get(null, function(items){
            $('#domains').val(items.domains.join("\n"));
        });

        $('#domains').change(function(){
            var domainList = $('#domains').val().split("\n");
            for ( var i in domainList ) {
                domainList[i] = $.trim(domainList[i]);
            }

            console.log(domainList);

            chrome.storage.sync.set({
                domains: domainList
            });
        });

        $('#save').click(function(){
            // I just want to trigger change()
            $(this).text('Saved!');
        });
    },

    isReachable: function() {
        var reachable = JSON.parse(localStorage.getItem('reachable'));

        $('#cache-reachable')
            .text(reachable ? 'reachable' : 'unreachable')
            .css('color', reachable ? 'green' : 'red');
    }

};

jQuery(CDNCacheFront.init);