<!-- index -->
<template>
  <default-layout id="index" class="page" :show-page-title="false">
    <div style="width: 100%;height: 100%;overflow: hidden;">
      <canvas id="canvas"></canvas>
    </div>
    <div class="welcome-inner">
      <p class="welcome-message">欢迎使用</p>
      <p class="project-name">{{ projectTitle }}</p>
    </div>
  </default-layout>
</template>
<script>
import $ from '../../static/jquery-3.5.1.min'
export default {
  metaInfo: {
    // title: '首页'
  },
  created () {
  },
  mounted () {
    /* ========== Prepare the Canvas ========== */
    var canvas = document.getElementById('canvas')
    var ctx = canvas.getContext('2d')
    ctx.canvas.width = $('.el-container').width()
    ctx.canvas.height = window.innerHeight - 48
    $(window).on('resize', function () {
      ctx.canvas.width = $('.el-container').width()
      ctx.canvas.height = window.innerHeight - 48
    })

    // ========== Default ==========
    let particles = []
    let numParticles = 200
    let distance = 120
    let speed = 0.5 // $("#speed").val() / 100;
    let radius = 2
    let lineWidth = 100 / 100
    let particleColor = '#dddddd'
    let lineColor = '#E5E5E5'
    let backgroundColor = '#F5F6FA'
    // ========== Default END ========== \\
    document.getElementById('canvas').style.backgroundColor = backgroundColor
    // ========== Color Functions ========== \\
    // Random Color Function
    function GetRandomColor () {
      let r = 0
      let g = 0
      let b = 0
      while (r < 100 && g < 100 && b < 100) {
        r = Math.floor(Math.random() * 256)
        g = Math.floor(Math.random() * 256)
        b = Math.floor(Math.random() * 256)
      }
      return 'rgb(' + r + ',' + g + ',' + b + ')'
    }

    // Convert Hex to RGB Values
    function hexToRGB (hex) {
      var hashed = hex.charAt(0) === '#' ? hex.substring(1, 7) : hex
      var R = parseInt(hashed.substring(0, 2), 16)
      var G = parseInt(hashed.substring(2, 4), 16)
      var B = parseInt(hashed.substring(4, 6), 16)
      // var RGB = `rgb(${R}, ${G}, ${B})`
      // I used a array here to return the Color Values separated.
      // Original Function: https://codepen.io/Tibixx/pen/RJbjBE
      return [R, G, B] // RGB;
    }
    // ========== Color Functions END ========== \\

    // ========== Particles ========== \\
    // Particle Properties
    let Particle = function () {
      this.x = ctx.canvas.width * Math.random()
      this.y = ctx.canvas.height * Math.random()
      this.vx = speed * 2 * Math.random() - speed
      this.vy = speed * 2 * Math.random() - speed
      if (particleColor === '') {
        this.Color = GetRandomColor()
      } else {
        this.Color = particleColor
      }
    }

    // Draw the Particle
    Particle.prototype.Draw = function (ctx) {
      ctx.fillStyle = this.Color
      ctx.arc(this.x, this.y, radius, 0, 2 * Math.PI)
      ctx.fill()
    }

    // Canvas Collision
    Particle.prototype.Update = function () {
      this.x += this.vx
      this.y += this.vy

      if (this.x < 0 + radius || this.x + radius > canvas.width) { this.vx = -this.vx }

      if (this.y - radius < 0 || this.y + radius > canvas.height) { this.vy = -this.vy }
    }
    // ========== Particles END ========== \\

    // Function to get the Distance between Particles
    function dist (x1, x2, y1, y2) {
      var a = x1 - x2
      var b = y1 - y2

      var c = Math.sqrt(a * a + b * b)
      return c
    }

    // The Animation Loop
    function loop () {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      for (var i = 0; i < numParticles; i++) {
        // console.log(i+" "+particles[i].x)
        for (var j = 0; j < numParticles; j++) {
          // For each Particle get the Distance between all other Particles
          let eachPartDist = dist(
            particles[j].x,
            particles[i].x,
            particles[j].y,
            particles[i].y
          )
          // Check the Distance between all Particles
          if (eachPartDist <= distance) {
            // Calculate the percentage Distance between Particles (Used for the Opacity of the Connectors)
            let proDist = 100 / distance
            let opacity = 1 - eachPartDist * proDist / 100

            // Call the hexToRGB Function (The R,G,B Values are used later on for the strokeStyle)
            let rgbCol = hexToRGB(lineColor)
            let rCol = rgbCol[0]
            let gCol = rgbCol[1]
            let bCol = rgbCol[2]

            // Start drawing the Connectors!
            ctx.beginPath()
            ctx.moveTo(particles[i].x, particles[i].y)
            ctx.strokeStyle = `rgba(${rCol}, ${gCol}, ${bCol}, ${opacity})`
            ctx.lineWidth = lineWidth
            ctx.lineTo(
              particles[j].x,
              particles[j].y,
              particles[i].x,
              particles[i].y
            )
            ctx.stroke()
            ctx.closePath()
          }
        }
        particles[i].Update()
        particles[i].Draw(ctx)
      }
      requestAnimationFrame(loop)
    }

    for (var i = 0; i < numParticles; i++) {
      particles.push(new Particle())
    }
    loop()
  },
  data () {
    return {
      projectTitle: process.env.PROJECT_NAME
    }
  },
  components: {},
  watch: {
    '$store.state.spread': function (nv, ov) {
      window.setTimeout(() => {
        console.log($('.el-container').width())
        var canvas = document.getElementById('canvas')
        var ctx = canvas.getContext('2d')
        ctx.canvas.width = $('.el-container').width()
        ctx.canvas.height = window.innerHeight - 48
      }, 500)
    }
  },
  methods: {}
}
</script>
<style lang="less">
  #index {
    .el-main.no-title {
      margin-top: 0;
    }
  }
</style>
<style scoped lang="less">
  .welcome-inner {
    position: absolute;
    top: 20%;
    width: 100%;
    margin-top: -18px;
  }
  .welcome-message {
    font-size: 24px;
    line-height: 1;
    text-align: center;
    font-weight: 400;
    color: #6257CD;
  }
  .project-name {
    font-size: 42px;
    font-weight: 600;
    text-align: center;
    color: #6257CD;
  }
  .promo{
    color: #fff;
    font-weight: 600;
    position: absolute;
    top: 5px;
    left: 5px;
    background: #292929;
    padding: 10px;
    transition: 0.3s;
    text-decoration: none;
    border-radius: 10px;
  }
  .promo:hover{
    background: #fff;
    color: #292929;
    transition: 0.3s;
    cursor: pointer;
  }
</style>
