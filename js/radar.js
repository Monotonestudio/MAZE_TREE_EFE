(function($) {
  $.fn.radar = function(method) {
    var currentMousePos = { x: -1, y: -1 };
    var FRAMES_PER_CYCLE=20; // number of frames per radar cycle
    var FRAMERATE=20; // frames per second
    var RINGS = 3;  // number of radar rings rendered


    $(document).mousemove(function(event) {
      currentMousePos.x = event.pageX;
      currentMousePos.y = event.pageY;
    });


    return this.each(function() {
      var centerReciprocal;
      var $this = $(this);
      
      if (!$this.get(0).getContext) return; // no canvas support
      var ctx = $this.get(0).getContext("2d");
      
      //calibrate sizes
      var canvassize = ($this.width()<$this.height())?$this.width():$this.height();

      if($this.width()>=1200){
        centerReciprocal = 8;
      }
      else if($this.width()>= 800 || $this.width()<1200){
        centerReciprocal = 6;
      }
      else if($this.width()>= 600 || $this.width()<800){
        centerReciprocal = 4;
      }
      else if($this.width()>= 200 || $this.width()<600){
        centerReciprocal = 2;
      }
      else {
        centerReciprocal = 1;
      }
      

      console.log(centerReciprocal);

      var ringsize = canvassize/(2*RINGS+1)/centerReciprocal;
      var radiusmax = ringsize/2 + ringsize + (RINGS-1)*ringsize;
      
      var animationframe=0;
      
      function animateRadarFrame()
      {
        ctx.clearRect(0,0,$this.width(),$this.height());

        var radius;
        var alpha;
        var scale = 0.3;
        var offsetX = 8;
        var offsetY = 8;
        
        for (var ringno=0;ringno<RINGS;ringno++)
        {
          radius = ringsize/2 + (animationframe/FRAMES_PER_CYCLE)*ringsize + ringno*ringsize;
          alpha = (radiusmax-radius)/radiusmax;
          ctx.beginPath();
          ctx.fillStyle = "rgba(0,0,0,"+alpha+")";
          //ctx.arc($this.width()/2,$this.height()/2,radius*scale,0,2*Math.PI,false);
          ctx.arc(currentMousePos.x-offsetX,currentMousePos.y-offsetY,radius*scale,0,2*Math.PI,false);
          ctx.fill();
        }
        
        ctx.beginPath();
        ctx.fillStyle = "rgba(120,220,220,40)";
        //ctx.arc($this.width()/2,$this.height()/2,ringsize/2,0,2*Math.PI,false);
        ctx.arc(currentMousePos.x-offsetX,currentMousePos.y-offsetY,ringsize/2,0,2*Math.PI,false);
        ctx.fill();
        
        if (animationframe>=(FRAMES_PER_CYCLE-1))
          animationframe=0;
        else
          animationframe=animationframe+1;
      }

      var radarAnimationID = setInterval(animateRadarFrame,1000/FRAMERATE); 

    })
}
})( jQuery );