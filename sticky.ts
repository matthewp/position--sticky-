interface IObservable {
  element: HTMLElement;
  parent: HTMLElement;
  repl: HTMLElement;
  start: number;
  end: number;
  oldCSS: any;
  newCSS: string;
  fixed: bool;
}

(function () {
  var slice = Array.prototype.slice;

  function getBodyOffset(body: HTMLBodyElement) {
    var top = body.offsetTop,
        left = body.offsetLeft;

    return { top: top, left: left };
  }

  function getOffset(elem: HTMLElement): any {
    var docElem, body, win, clientTop, clientLeft, scrollTop, scrollLeft,
        box = { top: 0, left: 0 },
        doc = elem && elem.ownerDocument;

    if (!doc) {
      return;
    }

    if ((body = doc.body) === elem) {
      return getBodyOffset(<HTMLBodyElement>elem);
    }

    docElem = doc.documentElement;

    // If we don't have gBCR, just use 0,0 rather than error
    // BlackBerry 5, iOS 3 (original iPhone)
    if (typeof elem.getBoundingClientRect !== "undefined") {
      box = elem.getBoundingClientRect();
    }
    win = window;
    clientTop = docElem.clientTop || body.clientTop || 0;
    clientLeft = docElem.clientLeft || body.clientLeft || 0;
    scrollTop = win.pageYOffset || docElem.scrollTop;
    scrollLeft = win.pageXOffset || docElem.scrollLeft;
    return {
      top: box.top + scrollTop - clientTop,
      left: box.left + scrollLeft - clientLeft
    };
  }

  function setStyle(elem: HTMLElement, repl: Object) {
    var style = elem.getAttribute('style').split(';'),
        newStyle = [];

    for (var i = 0; i < style.length; i++) {
      var both = style[i].split(':'),
          key = both[0], value = both[1];

      if (key in repl) {
        newStyle.push(key + ':' + repl[key]);
      } else {
        newStyle.push(both);
      }
    }

    elem.setAttribute('style', newStyle.join(';'));
  }

  var cssPattern = /\s*(.*?)\s*{(.*?)}/g,
      matchPosition = /\.*?position:.*?sticky.*?;/,
      getTop = /\.*?top:(.*?);/,
      toObserve: IObservable[] = [];

  function parse(css: string) {
    var matches,
        css = css.replace(/(\/\*([\s\S]*?)\*\/)|(\/\/(.*)$)/gm, '').replace(/\n|\r/g, '');

    while ((matches = cssPattern.exec(css)) !== null) {
      var selector = matches[1];
      if (matchPosition.test(matches[2]) && selector !== "#modernizr") {
        var topMatch = getTop.exec(matches[2]),
            topCSS = ((topMatch !== null) ? parseInt(topMatch[1]) : 0);

        var elems = slice.call(document.querySelectorAll(selector));
        elems.forEach(function (elem: HTMLElement) {
          var height = elem.offsetHeight,
              parent = elem.parentElement,
              parOff = getOffset(parent),
              parOffTop = ((parOff !== null && parOff.top !== null) ? parOff.top : 0),
              elmOff = getOffset(elem),
              elmOffTop = ((elmOff !== null && elmOff.top !== null) ? elmOff.top : 0),
              start = elmOffTop - topCSS,
              end = (parOffTop + parent.offsetHeight) - height - topCSS,
              newCSS = matches[2] + "position:fixed;width:" + elem.offsetWidth + "px;height:" + height + "px";

          var dummy = <HTMLDivElement>document.createElement('div');
          dummy.innerHTML = '<span style="position:static;display:block;height:' + height + 'px;"></span>';

          toObserve.push({
            element: elem,
            parent: parent,
            repl: <HTMLElement>dummy.firstElementChild,
            start: start,
            end: end,
            oldCSS: matches[2],
            newCSS: newCSS,
            fixed: false
          });
        });
      }
    }
  }

  window.addEventListener('scroll', function () {
    var scrollTop = document.documentElement.scrollTop || document.body.scrollTop;
    for (var i = 0; i < toObserve.length; i++) {
      var obj = toObserve[i];
      if (obj.fixed === false && scrollTop > obj.start && scrollTop < obj.end) {
        obj.element.setAttribute('style', obj.newCSS);
        obj.fixed = true;
        obj.element.classList.add('stuck');
      } else if (obj.fixed === true) {
        if (scrollTop < obj.start) {
          obj.element.setAttribute('style', obj.oldCSS);
          obj.fixed = false;
          obj.element.classList.remove('stuck');
        } else if (scrollTop > obj.end) {
          var absolute = getOffset(obj.element);
          absolute.position = "absolute"; // Overwrite with absolute;
          obj.element.setAttribute('style', obj.newCSS);
          setStyle(obj.element, absolute);
          obj.fixed = false;
          obj.element.classList.remove('stuck');
        }
      }
    }
  }, false);

  window.addEventListener('load', function () {
    var styles = slice.call(document.querySelectorAll('style'));
    styles.forEach(function (style) {
      var text = style.textContent || style.innerText;
      parse(text);
    });

    var links = slice.call(document.querySelectorAll('link'));
    links.forEach(function (link: HTMLLinkElement) {
      if (link.getAttribute('rel') !== 'stylesheet') {
        return;
      }

      var href = link.getAttribute('href'),
          req = new XMLHttpRequest();

      req.open('GET', href, true);
      req.onload = function (e) {
        parse(req.responseText);
      };
      req.send();
    });
  }, false);
})();