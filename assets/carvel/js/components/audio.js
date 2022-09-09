var AudioPlayerComponent = (function AudioPlayerComponent($) {
  var $components = $('body').find('.audio-player-component');
  var TEMPLATE = '<div class="audio-player"><button class="play-btn">Play</button><div class="progress-track"><div tabindex="0" class="progress"></div></div><button class="reset-btn">Reset</button><span class="time-elapsed">00:00</span><span class="time-total">--:--</span></div><div class="clearfix"></div>';

  function attachEvents($component) {
    $component.$toggleButton.on('click', function () {
      togglePlayer($component);
    });

    $component.$resetButton.on('click', function () {
      resetPlayer($component);
    });

    $component.$progressBar.parent().on('mousedown', function (e) {
      e.preventDefault();
      seek($component, $(this), e);
      $component.$progressBar.dragging = true;
    });

    $component.$progressBar.on('keydown', function (e) {
      keyboardSeek($component, $(this), e);
    });

    $(document).on('mouseup', function (e) {
      $component.$progressBar.dragging = false;
    });

    $(document).on('mousemove', function (e) {
      e.preventDefault();
      if ($component.$progressBar.dragging) {
        seek($component, $component.$progressBar.parent(), e);
      }
    });
  }

  function updateTime($component) {
    $component.$progressBar.css('width', $component.$nativePlayer.currentTime / $component.$nativePlayer.duration * 100 + '%');
    $component.$timeElapsed.html(prettyTime($component.$nativePlayer.currentTime));
    if (!$component.$nativePlayer.paused) {
      $component.$toggleButton.addClass('on');
    } else {
      clearInterval($component.updateInterval);
      $component.$toggleButton.removeClass('on');
    }
  }

  function seek($component, $seekBar, event) {
    var seekBarOffset = $seekBar.offset();
    var relX = event.pageX - seekBarOffset.left;
    var percentageX = relX / $seekBar.outerWidth() * 100;
    $component.$nativePlayer.currentTime = $component.$nativePlayer.duration / 100 * percentageX;
    if ($component.$nativePlayer.paused && $component.$nativePlayer.duration !== $component.$nativePlayer.currentTime) {
      togglePlayer($component);
    }
  }

  function keyboardSeek($component, $seekBar, event) {
    if (event.key != "Tab") {
      event.preventDefault();
      if (event.key == "ArrowLeft") {
        $component.$nativePlayer.currentTime = Math.floor($component.$nativePlayer.currentTime) - 5 < 0 ? 0 : Math.floor($component.$nativePlayer.currentTime) - 5;
        if ($component.$nativePlayer.paused && $component.$nativePlayer.duration !== $component.$nativePlayer.currentTime) {
          togglePlayer($component);
        }
      } else if (event.key == "ArrowRight") {
        $component.$nativePlayer.currentTime = Math.floor($component.$nativePlayer.currentTime) + 5 > Math.floor($component.$nativePlayer.duration) ? Math.floor($component.$nativePlayer.duration) : Math.floor($component.$nativePlayer.currentTime) + 5;
        if ($component.$nativePlayer.paused && $component.$nativePlayer.duration !== $component.$nativePlayer.currentTime) {
          togglePlayer($component);
        }
      } else if (event.key == "Escape") {
        resetPlayer($component);
      } else if (event.key == "Space") {
        togglePlayer($component);
      }
    }
  }

  function togglePlayer($component) {
    if ($component.$nativePlayer.paused) {
      $component.$resetButton.fadeIn();
      $component.$nativePlayer.play();
      $component.updateInterval = setInterval(function () {
        updateTime($component);
      }, 200);
    } else {
      $component.$toggleButton.removeClass('on');
      $component.$nativePlayer.pause();
      clearInterval($component.updateInterval);
    }
  }

  function resetPlayer($component) {
    $component.$resetButton.fadeOut();
    $component.$progressBar.css('width', '0');
    $component.$toggleButton.removeClass('on');
    $component.$nativePlayer.pause();
    $component.$nativePlayer.currentTime = 0;
    $component.$timeElapsed.html('00:00');
  }

  function createHTML($component) {
    return $(TEMPLATE).appendTo($($component));
  }

  function prettyTime($rawSeconds) {
    return Math.floor($rawSeconds / 60).toFixed().pad(2, '0') + ':' + ($rawSeconds % 60).toFixed().pad(2, '0');
  }

  function init() {
    if (!$components.length) return;

    String.prototype.pad = function (l, s) {
      return (l -= this.length) > 0
        ? (s = new Array(Math.ceil(l / s.length) + 1).join(s)).substr(0, s.length) + this + s.substr(0, l - s.length)
        : this;
    };

    $components.each(function () {
      $component = $(this);
      var $styledPlayer = createHTML($component);
      $component.$nativePlayer = $styledPlayer.prev()[0];
      $component.$toggleButton = $styledPlayer.find('.play-btn');
      $component.$resetButton = $styledPlayer.find('.reset-btn');
      $component.$progressBar = $styledPlayer.find('.progress');
      $component.$timeElapsed = $styledPlayer.find('.time-elapsed');
      $component.$timeTotal = $styledPlayer.find('.time-total');
      $component.$timeTotal.html(prettyTime($component.$nativePlayer.duration));
      $component.updateInterval;
      attachEvents($component);
    });

    // createHTML();
    // attachEvents();
  }

  return {
    init: init
  };

}(jQuery));

$(window).on('load', function () {
  AudioPlayerComponent.init();
});
