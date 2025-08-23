// UIBridge.js
const UIBridge = {
    _callbacks: {},
  
    register(name, fn) {
      this._callbacks[name] = fn;
    },
  
    unregister(name) {
      delete this._callbacks[name];
    },
  
    call(name, ...args) {
      if (typeof this._callbacks[name] === 'function') {
        return this._callbacks[name](...args);
      } else {
        console.warn(`UIBridge: No function registered under "${name}"`);
      }
    }
  };
  
// Expose globally for use in both sketch.js and PixertUI.jsx
if (typeof window !== 'undefined') {
    window.UIBridge = UIBridge;
}

// CommonJS export for Node.js/Electron environment
if (typeof module !== 'undefined' && module.exports) {
    module.exports = UIBridge;
}