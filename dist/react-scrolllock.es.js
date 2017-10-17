import { Component } from 'react';
import PropTypes from 'prop-types';

var asyncGenerator = function () {
  function AwaitValue(value) {
    this.value = value;
  }

  function AsyncGenerator(gen) {
    var front, back;

    function send(key, arg) {
      return new Promise(function (resolve, reject) {
        var request = {
          key: key,
          arg: arg,
          resolve: resolve,
          reject: reject,
          next: null
        };

        if (back) {
          back = back.next = request;
        } else {
          front = back = request;
          resume(key, arg);
        }
      });
    }

    function resume(key, arg) {
      try {
        var result = gen[key](arg);
        var value = result.value;

        if (value instanceof AwaitValue) {
          Promise.resolve(value.value).then(function (arg) {
            resume("next", arg);
          }, function (arg) {
            resume("throw", arg);
          });
        } else {
          settle(result.done ? "return" : "normal", result.value);
        }
      } catch (err) {
        settle("throw", err);
      }
    }

    function settle(type, value) {
      switch (type) {
        case "return":
          front.resolve({
            value: value,
            done: true
          });
          break;

        case "throw":
          front.reject(value);
          break;

        default:
          front.resolve({
            value: value,
            done: false
          });
          break;
      }

      front = front.next;

      if (front) {
        resume(front.key, front.arg);
      } else {
        back = null;
      }
    }

    this._invoke = send;

    if (typeof gen.return !== "function") {
      this.return = undefined;
    }
  }

  if (typeof Symbol === "function" && Symbol.asyncIterator) {
    AsyncGenerator.prototype[Symbol.asyncIterator] = function () {
      return this;
    };
  }

  AsyncGenerator.prototype.next = function (arg) {
    return this._invoke("next", arg);
  };

  AsyncGenerator.prototype.throw = function (arg) {
    return this._invoke("throw", arg);
  };

  AsyncGenerator.prototype.return = function (arg) {
    return this._invoke("return", arg);
  };

  return {
    wrap: function (fn) {
      return function () {
        return new AsyncGenerator(fn.apply(this, arguments));
      };
    },
    await: function (value) {
      return new AwaitValue(value);
    }
  };
}();





var classCallCheck = function (instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
};

var createClass = function () {
  function defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];
      descriptor.enumerable = descriptor.enumerable || false;
      descriptor.configurable = true;
      if ("value" in descriptor) descriptor.writable = true;
      Object.defineProperty(target, descriptor.key, descriptor);
    }
  }

  return function (Constructor, protoProps, staticProps) {
    if (protoProps) defineProperties(Constructor.prototype, protoProps);
    if (staticProps) defineProperties(Constructor, staticProps);
    return Constructor;
  };
}();









var inherits = function (subClass, superClass) {
  if (typeof superClass !== "function" && superClass !== null) {
    throw new TypeError("Super expression must either be null or a function, not " + typeof superClass);
  }

  subClass.prototype = Object.create(superClass && superClass.prototype, {
    constructor: {
      value: subClass,
      enumerable: false,
      writable: true,
      configurable: true
    }
  });
  if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass;
};











var possibleConstructorReturn = function (self, call) {
  if (!self) {
    throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
  }

  return call && (typeof call === "object" || typeof call === "function") ? call : self;
};

/*
	NOTES

	1. Stop content jumping around when overflow is hidden on the body.
	2. Mobile Safari ignores { overflow: hidden } declaration on the body.
	3. Allow scroll on provided target.
*/

var listenerOptions = { capture: false, passive: false };

var ScrollLock = function (_Component) {
	inherits(ScrollLock, _Component);

	function ScrollLock() {
		classCallCheck(this, ScrollLock);
		return possibleConstructorReturn(this, (ScrollLock.__proto__ || Object.getPrototypeOf(ScrollLock)).apply(this, arguments));
	}

	createClass(ScrollLock, [{
		key: 'componentDidMount',
		value: function componentDidMount() {
			if (!canUseDom()) return;

			var scrollTarget = this.props.scrollTarget;
			var target = document.body;

			if (this.props.preventContentJumping) {
				var scrollbarWidth = window.innerWidth - document.body.clientWidth; // 1.

				target.style.paddingRight = scrollbarWidth + 'px';
			}
			target.style.overflowY = 'hidden';

			target.addEventListener('touchmove', preventTouchMove, listenerOptions); // 2.

			if (scrollTarget) {
				scrollTarget.addEventListener('touchstart', preventInertiaScroll, listenerOptions); // 3.
				scrollTarget.addEventListener('touchmove', allowTouchMove, listenerOptions); // 3.
			}
		}
	}, {
		key: 'componentWillUnmount',
		value: function componentWillUnmount() {
			if (!canUseDom()) return;

			var scrollTarget = this.props.scrollTarget;
			var target = document.body;

			if (this.props.preventContentJumping) {
				target.style.paddingRight = '';
			}
			target.style.overflowY = '';

			target.removeEventListener('touchmove', preventTouchMove, listenerOptions);

			if (scrollTarget) {
				scrollTarget.removeEventListener('touchstart', preventInertiaScroll, listenerOptions);
				scrollTarget.removeEventListener('touchmove', allowTouchMove, listenerOptions);
			}
		}
	}, {
		key: 'render',
		value: function render() {
			return null;
		}
	}]);
	return ScrollLock;
}(Component);


ScrollLock.propTypes = {
	scrollTarget: PropTypes.object,
	preventContentJumping: PropTypes.bool
};
ScrollLock.defaultProps = {
	preventContentJumping: true
};

function preventTouchMove(e) {
	e.preventDefault();
}

function allowTouchMove(e) {
	e.stopPropagation();
}

function preventInertiaScroll() {
	var top = this.scrollTop;
	var totalScroll = this.scrollHeight;
	var currentScroll = top + this.offsetHeight;

	if (top === 0) {
		this.scrollTop = 1;
	} else if (currentScroll === totalScroll) {
		this.scrollTop = top - 1;
	}
}

function canUseDom() {
	return !!(typeof window !== 'undefined' && window.document && window.document.createElement);
}

export default ScrollLock;
