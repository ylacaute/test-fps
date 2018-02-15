var HANDJS = HANDJS || {};
(function () {
  function x() {
    E = true;
    clearTimeout(S);
    S = setTimeout(function () {
      E = false
    }, 700)
  }

  if (!Array.prototype.indexOf) {
    Array.prototype.indexOf = function (e) {
      var t = Object(this);
      var n = t.length >>> 0;
      if (n === 0) {
        return -1
      }
      var r = 0;
      if (arguments.length > 0) {
        r = Number(arguments[1]);
        if (r != r) {
          r = 0
        } else if (r != 0 && r != Infinity && r != -Infinity) {
          r = (r > 0 || -1) * Math.floor(Math.abs(r))
        }
      }
      if (r >= n) {
        return -1
      }
      var i = r >= 0 ? r : Math.max(n - Math.abs(r), 0);
      for (; i < n; i++) {
        if (i in t && t[i] === e) {
          return i
        }
      }
      return -1
    }
  }
  var e = ["pointerdown", "pointerup", "pointermove", "pointerover", "pointerout", "pointercancel", "pointerenter", "pointerleave"];
  var t = ["PointerDown", "PointerUp", "PointerMove", "PointerOver", "PointerOut", "PointerCancel", "PointerEnter", "PointerLeave"];
  var n = "touch";
  var r = "pen";
  var i = "mouse";
  var s = {};
  var o = function (e) {
    while (e && !e.handjs_forcePreventDefault) {
      e = e.parentNode
    }
    return !!e || window.handjs_forcePreventDefault
  };
  var u = function (e, t, n, r) {
    var i;
    if (document.createEvent) {
      i = document.createEvent("MouseEvents");
      i.initMouseEvent(t, n, true, window, 1, e.screenX, e.screenY, e.clientX, e.clientY, e.ctrlKey, e.altKey, e.shiftKey, e.metaKey, e.button, null)
    } else {
      i = document.createEventObject();
      i.screenX = e.screenX;
      i.screenY = e.screenY;
      i.clientX = e.clientX;
      i.clientY = e.clientY;
      i.ctrlKey = e.ctrlKey;
      i.altKey = e.altKey;
      i.shiftKey = e.shiftKey;
      i.metaKey = e.metaKey;
      i.button = e.button
    }
    if (i.offsetX === undefined) {
      if (e.offsetX !== undefined) {
        if (Object && Object.defineProperty !== undefined) {
          Object.defineProperty(i, "offsetX", {writable: true});
          Object.defineProperty(i, "offsetY", {writable: true})
        }
        i.offsetX = e.offsetX;
        i.offsetY = e.offsetY
      } else if (Object && Object.defineProperty !== undefined) {
        Object.defineProperty(i, "offsetX", {
          get: function () {
            if (this.currentTarget && this.currentTarget.offsetLeft) {
              return e.clientX - this.currentTarget.offsetLeft
            }
            return e.clientX
          }
        });
        Object.defineProperty(i, "offsetY", {
          get: function () {
            if (this.currentTarget && this.currentTarget.offsetTop) {
              return e.clientY - this.currentTarget.offsetTop
            }
            return e.clientY
          }
        })
      } else if (e.layerX !== undefined) {
        i.offsetX = e.layerX - e.currentTarget.offsetLeft;
        i.offsetY = e.layerY - e.currentTarget.offsetTop
      }
    }
    if (e.isPrimary !== undefined) i.isPrimary = e.isPrimary; else i.isPrimary = true;
    if (e.pressure) i.pressure = e.pressure; else {
      var s = 0;
      if (e.which !== undefined) s = e.which; else if (e.button !== undefined) {
        s = e.button
      }
      i.pressure = s == 0 ? 0 : .5
    }
    if (e.rotation) i.rotation = e.rotation; else i.rotation = 0;
    if (e.hwTimestamp) i.hwTimestamp = e.hwTimestamp; else i.hwTimestamp = 0;
    if (e.tiltX) i.tiltX = e.tiltX; else i.tiltX = 0;
    if (e.tiltY) i.tiltY = e.tiltY; else i.tiltY = 0;
    if (e.height) i.height = e.height; else i.height = 0;
    if (e.width) i.width = e.width; else i.width = 0;
    i.preventDefault = function () {
      if (e.preventDefault !== undefined) e.preventDefault()
    };
    if (i.stopPropagation !== undefined) {
      var u = i.stopPropagation;
      i.stopPropagation = function () {
        if (e.stopPropagation !== undefined) e.stopPropagation();
        u.call(this)
      }
    }
    i.pointerId = e.pointerId;
    i.pointerType = e.pointerType;
    switch (i.pointerType) {
      case 2:
        i.pointerType = i.POINTER_TYPE_TOUCH;
        break;
      case 3:
        i.pointerType = i.POINTER_TYPE_PEN;
        break;
      case 4:
        i.pointerType = i.POINTER_TYPE_MOUSE;
        break
    }
    if (e.currentTarget && o(e.currentTarget) === true) {
      i.preventDefault()
    }
    if (r) r.dispatchEvent(i); else if (e.target) {
      e.target.dispatchEvent(i)
    } else {
      e.srcElement.fireEvent("on" + v(t), i)
    }
  };
  var a = function (e, t, n, r) {
    e.pointerId = 1;
    e.pointerType = i;
    u(e, t, n, r)
  };
  var f = function (e, t, n, r) {
    var i = r ? r : e.target;
    if (h(i, t)) {
      a(e, t, n, r)
    }
  };
  var l = function (e, t, r, i) {
    var s = t.identifier + 2;
    t.pointerId = s;
    t.pointerType = n;
    t.currentTarget = r;
    t.target = r;
    if (i.preventDefault !== undefined) {
      t.preventDefault = function () {
        i.preventDefault()
      }
    }
    u(t, e, true)
  };
  var c = function (e, t) {
    return e.__handjsGlobalRegisteredEvents && e.__handjsGlobalRegisteredEvents[t]
  };
  var h = function (e, t) {
    while (e && !c(e, t)) e = e.parentNode;
    if (e) return e; else if (c(window, t)) return window
  };
  var p = function (e, t, n, r) {
    if (h(n, e)) {
      l(e, t, n, r)
    }
  };
  var d = function (e, t, n, r) {
    if (e.preventManipulation) e.preventManipulation();
    for (var i = 0; i < e.changedTouches.length; ++i) {
      var o = e.changedTouches[i];
      if (n) {
        s[o.identifier] = o.target
      }
      if (r) {
        p(t, o, s[o.identifier], e)
      } else {
        l(t, o, s[o.identifier], e)
      }
    }
  };
  var v = function (e) {
    return e.toLowerCase().replace("pointer", "mouse")
  };
  var m = function (n, r, i) {
    var s = e.indexOf(i);
    var o = r + t[s];
    if (o === r + "PointerEnter" && n["on" + r.toLowerCase() + "pointerenter"] === undefined) {
      o = r + "PointerOver"
    }
    if (o === r + "PointerLeave" && n["on" + r.toLowerCase() + "pointerleave"] === undefined) {
      o = r + "PointerOut"
    }
    return o
  };
  var g = function (e, t, n, r) {
    if (e.__handjsRegisteredEvents === undefined) {
      e.__handjsRegisteredEvents = []
    }
    if (r) {
      if (e.__handjsRegisteredEvents[t] !== undefined) {
        e.__handjsRegisteredEvents[t]++;
        return
      }
      e.__handjsRegisteredEvents[t] = 1;
      e.addEventListener(t, n, false)
    } else {
      if (e.__handjsRegisteredEvents.indexOf(t) !== -1) {
        e.__handjsRegisteredEvents[t]--;
        if (e.__handjsRegisteredEvents[t] != 0) {
          return
        }
      }
      e.removeEventListener(t, n);
      e.__handjsRegisteredEvents[t] = 0
    }
  };
  var y = function (e, t, n) {
    if (e.onpointerdown !== undefined) {
      return
    }
    if (e.onmspointerdown !== undefined) {
      var r = m(e, "MS", t);
      g(e, r, function (e) {
        u(e, t, true)
      }, n);
      return
    }
    if (!e.__handjsGlobalRegisteredEvents) {
      e.__handjsGlobalRegisteredEvents = []
    }
    if (n) {
      if (e.__handjsGlobalRegisteredEvents[t] !== undefined) {
        e.__handjsGlobalRegisteredEvents[t]++;
        return
      }
      e.__handjsGlobalRegisteredEvents[t] = 1
    } else {
      if (e.__handjsGlobalRegisteredEvents[t] !== undefined) {
        e.__handjsGlobalRegisteredEvents[t]--;
        if (e.__handjsGlobalRegisteredEvents[t] < 0) {
          e.__handjsGlobalRegisteredEvents[t] = 0
        }
      }
    }
    if (e.ontouchstart !== undefined) {
      switch (t) {
        case"pointermove":
          g(e, "touchmove", function (e) {
            d(e, t)
          }, n);
          break;
        case"pointercancel":
          g(e, "touchcancel", function (e) {
            d(e, t)
          }, n);
          break
      }
    }
  };
  var b = function (t) {
    var n = t.prototype ? t.prototype.addEventListener : t.addEventListener;
    var r = function (t, r, i) {
      if (e.indexOf(t) != -1) {
        y(this, t, true)
      }
      if (n === undefined) {
        this.attachEvent("on" + v(t), r)
      } else {
        n.call(this, t, r, i)
      }
    };
    if (t.prototype) {
      t.prototype.addEventListener = r
    } else {
      t.addEventListener = r
    }
  };
  var w = function (t) {
    var n = t.prototype ? t.prototype.removeEventListener : t.removeEventListener;
    var r = function (t, r, i) {
      if (e.indexOf(t) != -1) {
        y(this, t, false)
      }
      if (n === undefined) {
        this.detachEvent(v(t), r)
      } else {
        n.call(this, t, r, i)
      }
    };
    if (t.prototype) {
      t.prototype.removeEventListener = r
    } else {
      t.removeEventListener = r
    }
  };
  b(window);
  b(typeof HTMLElement !== "undefined" ? HTMLElement : Element);
  b(document);
  b(HTMLBodyElement);
  b(HTMLDivElement);
  b(HTMLImageElement);
  b(HTMLUListElement);
  b(HTMLAnchorElement);
  b(HTMLLIElement);
  b(HTMLTableElement);
  if (window.HTMLSpanElement) {
    b(HTMLSpanElement)
  }
  if (window.HTMLCanvasElement) {
    b(HTMLCanvasElement)
  }
  if (window.SVGElement) {
    b(SVGElement)
  }
  w(window);
  w(typeof HTMLElement !== "undefined" ? HTMLElement : Element);
  w(document);
  w(HTMLBodyElement);
  w(HTMLDivElement);
  w(HTMLImageElement);
  w(HTMLUListElement);
  w(HTMLAnchorElement);
  w(HTMLLIElement);
  w(HTMLTableElement);
  if (window.HTMLSpanElement) {
    w(HTMLSpanElement)
  }
  if (window.HTMLCanvasElement) {
    w(HTMLCanvasElement)
  }
  if (window.SVGElement) {
    w(SVGElement)
  }
  var E = false;
  var S = -1;
  window.addEventListener("mousedown", function (e) {
    if (!E) f(e, "pointerdown", true)
  });
  window.addEventListener("mousemove", function (e) {
    if (!E) f(e, "pointermove", true)
  });
  window.addEventListener("mouseup", function (e) {
    if (!E) f(e, "pointerup", true)
  });
  window.addEventListener("mouseover", function (e) {
    f(e, "pointerover", true)
  });
  window.addEventListener("mouseout", function (e) {
    f(e, "pointerout", true)
  });
  window.addEventListener("mouseover", function (e) {
    var t = h(e.target, "pointerenter");
    if (!t || t === window) return; else if (!t.contains(e.relatedTarget)) {
      var n = t;
      var r = [];
      while (n && n != e.relatedTarget) {
        if (c(n, "pointerenter")) r.push(n);
        n = n.parentNode
      }
      while (r.length > 0) a(e, "pointerenter", false, r.pop())
    }
  });
  window.addEventListener("mouseout", function (e) {
    var t = h(e.target, "pointerleave");
    if (!t || t === window) return; else if (!t.contains(e.relatedTarget)) {
      var n = t;
      while (n && n != e.relatedTarget) {
        if (c(n, "pointerleave")) a(e, "pointerleave", false, n);
        n = n.parentNode
      }
    }
  });
  if (window.ontouchstart !== undefined) {
    window.addEventListener("touchstart", function (e) {
      for (var t = 0; t < e.changedTouches.length; ++t) {
        var n = e.changedTouches[t];
        s[n.identifier] = n.target;
        p("pointerenter", n, n.target, e);
        p("pointerover", n, n.target, e);
        p("pointerdown", n, n.target, e)
      }
      x()
    });
    window.addEventListener("touchend", function (e) {
      for (var t = 0; t < e.changedTouches.length; ++t) {
        var n = e.changedTouches[t];
        var r = s[n.identifier];
        p("pointerup", n, r, e);
        p("pointerout", n, r, e);
        p("pointerleave", n, r, e)
      }
      x()
    });
    window.addEventListener("touchmove", function (e) {
      for (var t = 0; t < e.changedTouches.length; ++t) {
        var n = e.changedTouches[t];
        var r = document.elementFromPoint(n.clientX, n.clientY);
        var i = s[n.identifier];
        if (i === r) {
          continue
        }
        if (i) {
          p("pointerout", n, i, e);
          if (!i.contains(r)) {
            p("pointerleave", n, i, e)
          }
        }
        if (r) {
          p("pointerover", n, r, e);
          if (!r.contains(i)) {
            p("pointerenter", n, r, e)
          }
        }
        s[n.identifier] = r
      }
      x()
    })
  }
  if (navigator.pointerEnabled === undefined) {
    navigator.pointerEnabled = true;
    if (navigator.msPointerEnabled) {
      navigator.maxTouchPoints = navigator.msMaxTouchPoints
    }
  }
  if (document.styleSheets && document.addEventListener) {
    document.addEventListener("DOMContentLoaded", function () {
      if (HANDJS.doNotProcessCSS) {
        return
      }
      var e = function (e) {
        return e.replace(/^\s+|\s+$/, "")
      };
      var t = function (t) {
        var n = new RegExp(".+?{.*?}", "m");
        var r = new RegExp(".+?{", "m");
        while (t != "") {
          var i = n.exec(t);
          if (!i) {
            break
          }
          var s = i[0];
          t = e(t.replace(s, ""));
          var o = e(r.exec(s)[0].replace("{", ""));
          if (s.replace(/\s/g, "").indexOf("touch-action:none") != -1) {
            var u = document.querySelectorAll(o);
            for (var a = 0; a < u.length; a++) {
              var f = u[a];
              if (f.style.msTouchAction !== undefined) {
                f.style.msTouchAction = "none"
              } else {
                f.handjs_forcePreventDefault = true
              }
            }
          }
        }
      };
      try {
        for (var n = 0; n < document.styleSheets.length; n++) {
          var r = document.styleSheets[n];
          if (r.href == undefined) {
            continue
          }
          var i = new XMLHttpRequest;
          i.open("get", r.href, false);
          i.send();
          var s = i.responseText.replace(/(\n|\r)/g, "");
          t(s)
        }
      } catch (o) {
      }
      var u = document.getElementsByTagName("style");
      for (var n = 0; n < u.length; n++) {
        var a = u[n];
        var f = e(a.innerHTML.replace(/(\n|\r)/g, ""));
        t(f)
      }
    }, false)
  }
})()
