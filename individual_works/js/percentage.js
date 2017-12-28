$.fn.extend({          
    percentageBar: function(num) {            
        var self = $(this),
            len = Math.floor(num/2);
        var el = '<div class="percentageBar"><div class="container"><div class="wrapper"><ul class="progress"></ul></div><div class="layer"></div></div></div>';
        self.append(el);
        for(var i = 0;i <= len;i++){
           $(".progress").append('<li></li>'); 
        } 
        $('.wrapper').width(num+'%');
        var left = $('.wrapper').width()-$('.layer').width()/2;
        $('.layer').html(num+'%').css({'left':left});
    }       
}); 