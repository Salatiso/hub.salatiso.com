/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
const stringToByteArray$1=function(e){const i=[];let s=0;for(let o=0;o<e.length;o++){let l=e.charCodeAt(o);l<128?i[s++]=l:l<2048?(i[s++]=l>>6|192,i[s++]=63&l|128):55296==(64512&l)&&o+1<e.length&&56320==(64512&e.charCodeAt(o+1))?(l=65536+((1023&l)<<10)+(1023&e.charCodeAt(++o)),i[s++]=l>>18|240,i[s++]=l>>12&63|128,i[s++]=l>>6&63|128,i[s++]=63&l|128):(i[s++]=l>>12|224,i[s++]=l>>6&63|128,i[s++]=63&l|128)}return i},e={byteToCharMap_:null,charToByteMap_:null,byteToCharMapWebSafe_:null,charToByteMapWebSafe_:null,ENCODED_VALS_BASE:"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789",get ENCODED_VALS(){return this.ENCODED_VALS_BASE+"+/="},get ENCODED_VALS_WEBSAFE(){return this.ENCODED_VALS_BASE+"-_."},HAS_NATIVE_SUPPORT:"function"==typeof atob,encodeByteArray(e,i){if(!Array.isArray(e))throw Error("encodeByteArray takes an array as a parameter");this.init_();const s=i?this.byteToCharMapWebSafe_:this.byteToCharMap_,o=[];for(let l=0;l<e.length;l+=3){const i=e[l],h=l+1<e.length,d=h?e[l+1]:0,_=l+2<e.length,f=_?e[l+2]:0,g=i>>2,v=(3&i)<<4|d>>4;let w=(15&d)<<2|f>>6,b=63&f;_||(b=64,h||(w=64)),o.push(s[g],s[v],s[w],s[b])}return o.join("")},encodeString(e,i){return this.HAS_NATIVE_SUPPORT&&!i?btoa(e):this.encodeByteArray(stringToByteArray$1(e),i)},decodeString(e,i){return this.HAS_NATIVE_SUPPORT&&!i?atob(e):function(e){const i=[];let s=0,o=0;for(;s<e.length;){const l=e[s++];if(l<128)i[o++]=String.fromCharCode(l);else if(l>191&&l<224){const h=e[s++];i[o++]=String.fromCharCode((31&l)<<6|63&h)}else if(l>239&&l<365){const h=((7&l)<<18|(63&e[s++])<<12|(63&e[s++])<<6|63&e[s++])-65536;i[o++]=String.fromCharCode(55296+(h>>10)),i[o++]=String.fromCharCode(56320+(1023&h))}else{const h=e[s++],d=e[s++];i[o++]=String.fromCharCode((15&l)<<12|(63&h)<<6|63&d)}}return i.join("")}(this.decodeStringToByteArray(e,i))},decodeStringToByteArray(e,i){this.init_();const s=i?this.charToByteMapWebSafe_:this.charToByteMap_,o=[];for(let l=0;l<e.length;){const i=s[e.charAt(l++)],h=l<e.length?s[e.charAt(l)]:0;++l;const d=l<e.length?s[e.charAt(l)]:64;++l;const _=l<e.length?s[e.charAt(l)]:64;if(++l,null==i||null==h||null==d||null==_)throw new DecodeBase64StringError;const f=i<<2|h>>4;if(o.push(f),64!==d){const e=h<<4&240|d>>2;if(o.push(e),64!==_){const e=d<<6&192|_;o.push(e)}}}return o},init_(){if(!this.byteToCharMap_){this.byteToCharMap_={},this.charToByteMap_={},this.byteToCharMapWebSafe_={},this.charToByteMapWebSafe_={};for(let e=0;e<this.ENCODED_VALS.length;e++)this.byteToCharMap_[e]=this.ENCODED_VALS.charAt(e),this.charToByteMap_[this.byteToCharMap_[e]]=e,this.byteToCharMapWebSafe_[e]=this.ENCODED_VALS_WEBSAFE.charAt(e),this.charToByteMapWebSafe_[this.byteToCharMapWebSafe_[e]]=e,e>=this.ENCODED_VALS_BASE.length&&(this.charToByteMap_[this.ENCODED_VALS_WEBSAFE.charAt(e)]=e,this.charToByteMapWebSafe_[this.ENCODED_VALS.charAt(e)]=e)}}};class DecodeBase64StringError extends Error{constructor(){super(...arguments),this.name="DecodeBase64StringError"}}const base64urlEncodeWithoutPadding=function(i){return function(i){const s=stringToByteArray$1(i);return e.encodeByteArray(s,!0)}(i).replace(/\./g,"")},base64Decode=function(i){try{return e.decodeString(i,!0)}catch(s){}return null};
/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
const getDefaultsFromGlobal=()=>
/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
function(){if("undefined"!=typeof self)return self;if("undefined"!=typeof window)return window;if("undefined"!=typeof global)return global;throw new Error("Unable to locate global object.")}().__FIREBASE_DEFAULTS__,getDefaults=()=>{try{return getDefaultsFromGlobal()||(()=>{if("undefined"==typeof process||void 0===process.env)return;const e={}.__FIREBASE_DEFAULTS__;return e?JSON.parse(e):void 0})()||(()=>{if("undefined"==typeof document)return;let e;try{e=document.cookie.match(/__FIREBASE_DEFAULTS__=([^;]+)/)}catch(s){return}const i=e&&base64Decode(e[1]);return i&&JSON.parse(i)})()}catch(e){return}},getDefaultEmulatorHost=e=>{var i,s;return null===(s=null===(i=getDefaults())||void 0===i?void 0:i.emulatorHosts)||void 0===s?void 0:s[e]},getDefaultEmulatorHostnameAndPort=e=>{const i=getDefaultEmulatorHost(e);if(!i)return;const s=i.lastIndexOf(":");if(s<=0||s+1===i.length)throw new Error(`Invalid host ${i} with no separate hostname and port!`);const o=parseInt(i.substring(s+1),10);return"["===i[0]?[i.substring(1,s-1),o]:[i.substring(0,s),o]},getDefaultAppConfig=()=>{var e;return null===(e=getDefaults())||void 0===e?void 0:e.config},getExperimentalSetting=e=>{var i;return null===(i=getDefaults())||void 0===i?void 0:i[`_${e}`]};
/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
class Deferred{constructor(){this.reject=()=>{},this.resolve=()=>{},this.promise=new Promise((e,i)=>{this.resolve=e,this.reject=i})}wrapCallback(e){return(i,s)=>{i?this.reject(i):this.resolve(s),"function"==typeof e&&(this.promise.catch(()=>{}),1===e.length?e(i):e(i,s))}}}
/**
 * @license
 * Copyright 2021 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function createMockUserToken(e,i){if(e.uid)throw new Error('The "uid" field is no longer supported by mockUserToken. Please use "sub" instead for Firebase Auth User ID.');const s=i||"demo-project",o=e.iat||0,l=e.sub||e.user_id;if(!l)throw new Error("mockUserToken must contain 'sub' or 'user_id' field!");const h=Object.assign({iss:`https://securetoken.google.com/${s}`,aud:s,iat:o,exp:o+3600,auth_time:o,sub:l,user_id:l,firebase:{sign_in_provider:"custom",identities:{}}},e);return[base64urlEncodeWithoutPadding(JSON.stringify({alg:"none",type:"JWT"})),base64urlEncodeWithoutPadding(JSON.stringify(h)),""].join(".")}
/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function getUA(){return"undefined"!=typeof navigator&&"string"==typeof navigator.userAgent?navigator.userAgent:""}function isSafari(){return!function(){var e;const i=null===(e=getDefaults())||void 0===e?void 0:e.forceEnvironment;if("node"===i)return!0;if("browser"===i)return!1;try{return"[object process]"===Object.prototype.toString.call(global.process)}catch(s){return!1}}()&&!!navigator.userAgent&&navigator.userAgent.includes("Safari")&&!navigator.userAgent.includes("Chrome")}class FirebaseError extends Error{constructor(e,i,s){super(i),this.code=e,this.customData=s,this.name="FirebaseError",Object.setPrototypeOf(this,FirebaseError.prototype),Error.captureStackTrace&&Error.captureStackTrace(this,ErrorFactory.prototype.create)}}class ErrorFactory{constructor(e,i,s){this.service=e,this.serviceName=i,this.errors=s}create(e,...s){const o=s[0]||{},l=`${this.service}/${e}`,h=this.errors[e],d=h?function(e,s){return e.replace(i,(e,i)=>{const o=s[i];return null!=o?String(o):`<${i}?>`})}(h,o):"Error",_=`${this.serviceName}: ${d} (${l}).`;return new FirebaseError(l,_,o)}}const i=/\{\$([^}]+)}/g;function deepEqual(e,i){if(e===i)return!0;const s=Object.keys(e),o=Object.keys(i);for(const l of s){if(!o.includes(l))return!1;const s=e[l],h=i[l];if(isObject(s)&&isObject(h)){if(!deepEqual(s,h))return!1}else if(s!==h)return!1}for(const l of o)if(!s.includes(l))return!1;return!0}function isObject(e){return null!==e&&"object"==typeof e}
/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function querystring(e){const i=[];for(const[s,o]of Object.entries(e))Array.isArray(o)?o.forEach(e=>{i.push(encodeURIComponent(s)+"="+encodeURIComponent(e))}):i.push(encodeURIComponent(s)+"="+encodeURIComponent(o));return i.length?"&"+i.join("&"):""}function querystringDecode(e){const i={};return e.replace(/^\?/,"").split("&").forEach(e=>{if(e){const[s,o]=e.split("=");i[decodeURIComponent(s)]=decodeURIComponent(o)}}),i}function extractQuerystring(e){const i=e.indexOf("?");if(!i)return"";const s=e.indexOf("#",i);return e.substring(i,s>0?s:void 0)}class ObserverProxy{constructor(e,i){this.observers=[],this.unsubscribes=[],this.observerCount=0,this.task=Promise.resolve(),this.finalized=!1,this.onNoObservers=i,this.task.then(()=>{e(this)}).catch(e=>{this.error(e)})}next(e){this.forEachObserver(i=>{i.next(e)})}error(e){this.forEachObserver(i=>{i.error(e)}),this.close(e)}complete(){this.forEachObserver(e=>{e.complete()}),this.close()}subscribe(e,i,s){let o;if(void 0===e&&void 0===i&&void 0===s)throw new Error("Missing Observer.");o=function(e,i){if("object"!=typeof e||null===e)return!1;for(const s of i)if(s in e&&"function"==typeof e[s])return!0;return!1}(e,["next","error","complete"])?e:{next:e,error:i,complete:s},void 0===o.next&&(o.next=noop),void 0===o.error&&(o.error=noop),void 0===o.complete&&(o.complete=noop);const l=this.unsubscribeOne.bind(this,this.observers.length);return this.finalized&&this.task.then(()=>{try{this.finalError?o.error(this.finalError):o.complete()}catch(e){}}),this.observers.push(o),l}unsubscribeOne(e){void 0!==this.observers&&void 0!==this.observers[e]&&(delete this.observers[e],this.observerCount-=1,0===this.observerCount&&void 0!==this.onNoObservers&&this.onNoObservers(this))}forEachObserver(e){if(!this.finalized)for(let i=0;i<this.observers.length;i++)this.sendOne(i,e)}sendOne(e,i){this.task.then(()=>{if(void 0!==this.observers&&void 0!==this.observers[e])try{i(this.observers[e])}catch(s){"undefined"!=typeof console&&console.error}})}close(e){this.finalized||(this.finalized=!0,void 0!==e&&(this.finalError=e),this.task.then(()=>{this.observers=void 0,this.onNoObservers=void 0}))}}function noop(){}
/**
 * @license
 * Copyright 2021 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function getModularInstance(e){return e&&e._delegate?e._delegate:e}class Component{constructor(e,i,s){this.name=e,this.instanceFactory=i,this.type=s,this.multipleInstances=!1,this.serviceProps={},this.instantiationMode="LAZY",this.onInstanceCreated=null}setInstantiationMode(e){return this.instantiationMode=e,this}setMultipleInstances(e){return this.multipleInstances=e,this}setServiceProps(e){return this.serviceProps=e,this}setInstanceCreatedCallback(e){return this.onInstanceCreated=e,this}}
/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const s="[DEFAULT]";
/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Provider{constructor(e,i){this.name=e,this.container=i,this.component=null,this.instances=new Map,this.instancesDeferred=new Map,this.instancesOptions=new Map,this.onInitCallbacks=new Map}get(e){const i=this.normalizeInstanceIdentifier(e);if(!this.instancesDeferred.has(i)){const e=new Deferred;if(this.instancesDeferred.set(i,e),this.isInitialized(i)||this.shouldAutoInitialize())try{const s=this.getOrInitializeService({instanceIdentifier:i});s&&e.resolve(s)}catch(s){}}return this.instancesDeferred.get(i).promise}getImmediate(e){var i;const s=this.normalizeInstanceIdentifier(null==e?void 0:e.identifier),o=null!==(i=null==e?void 0:e.optional)&&void 0!==i&&i;if(!this.isInitialized(s)&&!this.shouldAutoInitialize()){if(o)return null;throw Error(`Service ${this.name} is not available`)}try{return this.getOrInitializeService({instanceIdentifier:s})}catch(l){if(o)return null;throw l}}getComponent(){return this.component}setComponent(e){if(e.name!==this.name)throw Error(`Mismatching Component ${e.name} for Provider ${this.name}.`);if(this.component)throw Error(`Component for ${this.name} has already been provided`);if(this.component=e,this.shouldAutoInitialize()){if(function(e){return"EAGER"===e.instantiationMode}
/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */(e))try{this.getOrInitializeService({instanceIdentifier:s})}catch(i){}for(const[e,s]of this.instancesDeferred.entries()){const o=this.normalizeInstanceIdentifier(e);try{const e=this.getOrInitializeService({instanceIdentifier:o});s.resolve(e)}catch(i){}}}}clearInstance(e=s){this.instancesDeferred.delete(e),this.instancesOptions.delete(e),this.instances.delete(e)}async delete(){const e=Array.from(this.instances.values());await Promise.all([...e.filter(e=>"INTERNAL"in e).map(e=>e.INTERNAL.delete()),...e.filter(e=>"_delete"in e).map(e=>e._delete())])}isComponentSet(){return null!=this.component}isInitialized(e=s){return this.instances.has(e)}getOptions(e=s){return this.instancesOptions.get(e)||{}}initialize(e={}){const{options:i={}}=e,s=this.normalizeInstanceIdentifier(e.instanceIdentifier);if(this.isInitialized(s))throw Error(`${this.name}(${s}) has already been initialized`);if(!this.isComponentSet())throw Error(`Component ${this.name} has not been registered yet`);const o=this.getOrInitializeService({instanceIdentifier:s,options:i});for(const[l,h]of this.instancesDeferred.entries()){s===this.normalizeInstanceIdentifier(l)&&h.resolve(o)}return o}onInit(e,i){var s;const o=this.normalizeInstanceIdentifier(i),l=null!==(s=this.onInitCallbacks.get(o))&&void 0!==s?s:new Set;l.add(e),this.onInitCallbacks.set(o,l);const h=this.instances.get(o);return h&&e(h,o),()=>{l.delete(e)}}invokeOnInitCallbacks(e,i){const s=this.onInitCallbacks.get(i);if(s)for(const l of s)try{l(e,i)}catch(o){}}getOrInitializeService({instanceIdentifier:e,options:i={}}){let o=this.instances.get(e);if(!o&&this.component&&(o=this.component.instanceFactory(this.container,{instanceIdentifier:(l=e,l===s?void 0:l),options:i}),this.instances.set(e,o),this.instancesOptions.set(e,i),this.invokeOnInitCallbacks(o,e),this.component.onInstanceCreated))try{this.component.onInstanceCreated(this.container,e,o)}catch(h){}var l;return o||null}normalizeInstanceIdentifier(e=s){return this.component?this.component.multipleInstances?e:s:e}shouldAutoInitialize(){return!!this.component&&"EXPLICIT"!==this.component.instantiationMode}}class ComponentContainer{constructor(e){this.name=e,this.providers=new Map}addComponent(e){const i=this.getProvider(e.name);if(i.isComponentSet())throw new Error(`Component ${e.name} has already been registered with ${this.name}`);i.setComponent(e)}addOrOverwriteComponent(e){this.getProvider(e.name).isComponentSet()&&this.providers.delete(e.name),this.addComponent(e)}getProvider(e){if(this.providers.has(e))return this.providers.get(e);const i=new Provider(e,this);return this.providers.set(e,i),i}getProviders(){return Array.from(this.providers.values())}}
/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */var o,l;(l=o||(o={}))[l.DEBUG=0]="DEBUG",l[l.VERBOSE=1]="VERBOSE",l[l.INFO=2]="INFO",l[l.WARN=3]="WARN",l[l.ERROR=4]="ERROR",l[l.SILENT=5]="SILENT";const h={debug:o.DEBUG,verbose:o.VERBOSE,info:o.INFO,warn:o.WARN,error:o.ERROR,silent:o.SILENT},d=o.INFO,_={[o.DEBUG]:"log",[o.VERBOSE]:"log",[o.INFO]:"info",[o.WARN]:"warn",[o.ERROR]:"error"},defaultLogHandler=(e,i,...s)=>{if(i<e.logLevel)return;(new Date).toISOString();if(!_[i])throw new Error(`Attempted to log a message with an invalid logType (value: ${i})`)};class Logger{constructor(e){this.name=e,this._logLevel=d,this._logHandler=defaultLogHandler,this._userLogHandler=null}get logLevel(){return this._logLevel}set logLevel(e){if(!(e in o))throw new TypeError(`Invalid value "${e}" assigned to \`logLevel\``);this._logLevel=e}setLogLevel(e){this._logLevel="string"==typeof e?h[e]:e}get logHandler(){return this._logHandler}set logHandler(e){if("function"!=typeof e)throw new TypeError("Value assigned to `logHandler` must be a function");this._logHandler=e}get userLogHandler(){return this._userLogHandler}set userLogHandler(e){this._userLogHandler=e}debug(...e){this._userLogHandler&&this._userLogHandler(this,o.DEBUG,...e),this._logHandler(this,o.DEBUG,...e)}log(...e){this._userLogHandler&&this._userLogHandler(this,o.VERBOSE,...e),this._logHandler(this,o.VERBOSE,...e)}info(...e){this._userLogHandler&&this._userLogHandler(this,o.INFO,...e),this._logHandler(this,o.INFO,...e)}warn(...e){this._userLogHandler&&this._userLogHandler(this,o.WARN,...e),this._logHandler(this,o.WARN,...e)}error(...e){this._userLogHandler&&this._userLogHandler(this,o.ERROR,...e),this._logHandler(this,o.ERROR,...e)}}let f,g;const v=new WeakMap,w=new WeakMap,b=new WeakMap,S=new WeakMap,C=new WeakMap;let D={get(e,i,s){if(e instanceof IDBTransaction){if("done"===i)return w.get(e);if("objectStoreNames"===i)return e.objectStoreNames||b.get(e);if("store"===i)return s.objectStoreNames[1]?void 0:s.objectStore(s.objectStoreNames[0])}return wrap(e[i])},set:(e,i,s)=>(e[i]=s,!0),has:(e,i)=>e instanceof IDBTransaction&&("done"===i||"store"===i)||i in e};function wrapFunction(e){return e!==IDBDatabase.prototype.transaction||"objectStoreNames"in IDBTransaction.prototype?(g||(g=[IDBCursor.prototype.advance,IDBCursor.prototype.continue,IDBCursor.prototype.continuePrimaryKey])).includes(e)?function(...i){return e.apply(unwrap(this),i),wrap(v.get(this))}:function(...i){return wrap(e.apply(unwrap(this),i))}:function(i,...s){const o=e.call(unwrap(this),i,...s);return b.set(o,i.sort?i.sort():[i]),wrap(o)}}function transformCachableValue(e){return"function"==typeof e?wrapFunction(e):(e instanceof IDBTransaction&&function(e){if(w.has(e))return;const i=new Promise((i,s)=>{const unlisten=()=>{e.removeEventListener("complete",complete),e.removeEventListener("error",error),e.removeEventListener("abort",error)},complete=()=>{i(),unlisten()},error=()=>{s(e.error||new DOMException("AbortError","AbortError")),unlisten()};e.addEventListener("complete",complete),e.addEventListener("error",error),e.addEventListener("abort",error)});w.set(e,i)}(e),i=e,(f||(f=[IDBDatabase,IDBObjectStore,IDBIndex,IDBCursor,IDBTransaction])).some(e=>i instanceof e)?new Proxy(e,D):e);var i}function wrap(e){if(e instanceof IDBRequest)return function(e){const i=new Promise((i,s)=>{const unlisten=()=>{e.removeEventListener("success",success),e.removeEventListener("error",error)},success=()=>{i(wrap(e.result)),unlisten()},error=()=>{s(e.error),unlisten()};e.addEventListener("success",success),e.addEventListener("error",error)});return i.then(i=>{i instanceof IDBCursor&&v.set(i,e)}).catch(()=>{}),C.set(i,e),i}(e);if(S.has(e))return S.get(e);const i=transformCachableValue(e);return i!==e&&(S.set(e,i),C.set(i,e)),i}const unwrap=e=>C.get(e);const k=["get","getKey","getAll","getAllKeys","count"],O=["put","add","delete","clear"],q=new Map;function getMethod(e,i){if(!(e instanceof IDBDatabase)||i in e||"string"!=typeof i)return;if(q.get(i))return q.get(i);const s=i.replace(/FromIndex$/,""),o=i!==s,l=O.includes(s);if(!(s in(o?IDBIndex:IDBObjectStore).prototype)||!l&&!k.includes(s))return;const method=async function(e,...i){const h=this.transaction(e,l?"readwrite":"readonly");let d=h.store;return o&&(d=d.index(i.shift())),(await Promise.all([d[s](...i),l&&h.done]))[0]};return q.set(i,method),method}D=(e=>({...e,get:(i,s,o)=>getMethod(i,s)||e.get(i,s,o),has:(i,s)=>!!getMethod(i,s)||e.has(i,s)}))(D);
/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
class PlatformLoggerServiceImpl{constructor(e){this.container=e}getPlatformInfoString(){return this.container.getProviders().map(e=>{if(function(e){const i=e.getComponent();return"VERSION"===(null==i?void 0:i.type)}(e)){const i=e.getImmediate();return`${i.library}/${i.version}`}return null}).filter(e=>e).join(" ")}}const j="@firebase/app",$="0.10.13",ee=new Logger("@firebase/app"),te="@firebase/app-compat",re="@firebase/analytics-compat",ne="@firebase/analytics",ie="@firebase/app-check-compat",se="@firebase/app-check",oe="@firebase/auth",ae="@firebase/auth-compat",ce="@firebase/database",ue="@firebase/data-connect",le="@firebase/database-compat",he="@firebase/functions",de="@firebase/functions-compat",_e="@firebase/installations",pe="@firebase/installations-compat",fe="@firebase/messaging",me="@firebase/messaging-compat",ge="@firebase/performance",Ee="@firebase/performance-compat",Ie="@firebase/remote-config",ye="@firebase/remote-config-compat",Te="@firebase/storage",Ae="@firebase/storage-compat",Pe="@firebase/firestore",ve="@firebase/vertexai-preview",Re="@firebase/firestore-compat",we="firebase",Ve="[DEFAULT]",be={[j]:"fire-core",[te]:"fire-core-compat",[ne]:"fire-analytics",[re]:"fire-analytics-compat",[se]:"fire-app-check",[ie]:"fire-app-check-compat",[oe]:"fire-auth",[ae]:"fire-auth-compat",[ce]:"fire-rtdb",[ue]:"fire-data-connect",[le]:"fire-rtdb-compat",[he]:"fire-fn",[de]:"fire-fn-compat",[_e]:"fire-iid",[pe]:"fire-iid-compat",[fe]:"fire-fcm",[me]:"fire-fcm-compat",[ge]:"fire-perf",[Ee]:"fire-perf-compat",[Ie]:"fire-rc",[ye]:"fire-rc-compat",[Te]:"fire-gcs",[Ae]:"fire-gcs-compat",[Pe]:"fire-fst",[Re]:"fire-fst-compat",[ve]:"fire-vertex","fire-js":"fire-js",[we]:"fire-js-all"},Se=new Map,Ce=new Map,De=new Map;function _addComponent(e,i){try{e.container.addComponent(i)}catch(s){ee.debug(`Component ${i.name} failed to register with FirebaseApp ${e.name}`,s)}}function _registerComponent(e){const i=e.name;if(De.has(i))return ee.debug(`There were multiple attempts to register component ${i}.`),!1;De.set(i,e);for(const s of Se.values())_addComponent(s,e);for(const s of Ce.values())_addComponent(s,e);return!0}function _getProvider(e,i){const s=e.container.getProvider("heartbeat").getImmediate({optional:!0});return s&&s.triggerHeartbeat(),e.container.getProvider(i)}function _isFirebaseServerApp(e){return void 0!==e.settings}
/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const ke=new ErrorFactory("app","Firebase",{"no-app":"No Firebase App '{$appName}' has been created - call initializeApp() first","bad-app-name":"Illegal App name: '{$appName}'","duplicate-app":"Firebase App named '{$appName}' already exists with different options or config","app-deleted":"Firebase App named '{$appName}' already deleted","server-app-deleted":"Firebase Server App has been deleted","no-options":"Need to provide options, when not being deployed to hosting via source.","invalid-app-argument":"firebase.{$appName}() takes either no argument or a Firebase App instance.","invalid-log-argument":"First argument to `onLog` must be null or a function.","idb-open":"Error thrown when opening IndexedDB. Original error: {$originalErrorMessage}.","idb-get":"Error thrown when reading from IndexedDB. Original error: {$originalErrorMessage}.","idb-set":"Error thrown when writing to IndexedDB. Original error: {$originalErrorMessage}.","idb-delete":"Error thrown when deleting from IndexedDB. Original error: {$originalErrorMessage}.","finalization-registry-not-supported":"FirebaseServerApp deleteOnDeref field defined but the JS runtime does not support FinalizationRegistry.","invalid-server-app-environment":"FirebaseServerApp is not for use in browser environments."});
/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
class FirebaseAppImpl{constructor(e,i,s){this._isDeleted=!1,this._options=Object.assign({},e),this._config=Object.assign({},i),this._name=i.name,this._automaticDataCollectionEnabled=i.automaticDataCollectionEnabled,this._container=s,this.container.addComponent(new Component("app",()=>this,"PUBLIC"))}get automaticDataCollectionEnabled(){return this.checkDestroyed(),this._automaticDataCollectionEnabled}set automaticDataCollectionEnabled(e){this.checkDestroyed(),this._automaticDataCollectionEnabled=e}get name(){return this.checkDestroyed(),this._name}get options(){return this.checkDestroyed(),this._options}get config(){return this.checkDestroyed(),this._config}get container(){return this._container}get isDeleted(){return this._isDeleted}set isDeleted(e){this._isDeleted=e}checkDestroyed(){if(this.isDeleted)throw ke.create("app-deleted",{appName:this._name})}}
/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Ne="10.14.1";function initializeApp(e,i={}){let s=e;if("object"!=typeof i){i={name:i}}const o=Object.assign({name:Ve,automaticDataCollectionEnabled:!1},i),l=o.name;if("string"!=typeof l||!l)throw ke.create("bad-app-name",{appName:String(l)});if(s||(s=getDefaultAppConfig()),!s)throw ke.create("no-options");const h=Se.get(l);if(h){if(deepEqual(s,h.options)&&deepEqual(o,h.config))return h;throw ke.create("duplicate-app",{appName:l})}const d=new ComponentContainer(l);for(const f of De.values())d.addComponent(f);const _=new FirebaseAppImpl(s,o,d);return Se.set(l,_),_}function getApp(e=Ve){const i=Se.get(e);if(!i&&e===Ve&&getDefaultAppConfig())return initializeApp();if(!i)throw ke.create("no-app",{appName:e});return i}function registerVersion(e,i,s){var o;let l=null!==(o=be[e])&&void 0!==o?o:e;s&&(l+=`-${s}`);const h=l.match(/\s|\//),d=i.match(/\s|\//);if(h||d){const e=[`Unable to register library "${l}" with version "${i}":`];return h&&e.push(`library name "${l}" contains illegal characters (whitespace or "/")`),h&&d&&e.push("and"),d&&e.push(`version name "${i}" contains illegal characters (whitespace or "/")`),void ee.warn(e.join(" "))}_registerComponent(new Component(`${l}-version`,()=>({library:l,version:i}),"VERSION"))}
/**
 * @license
 * Copyright 2021 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Oe="firebase-heartbeat-store";let Me=null;function getDbPromise(){return Me||(Me=function(e,i,{blocked:s,upgrade:o,blocking:l,terminated:h}={}){const d=indexedDB.open(e,i),_=wrap(d);return o&&d.addEventListener("upgradeneeded",e=>{o(wrap(d.result),e.oldVersion,e.newVersion,wrap(d.transaction),e)}),s&&d.addEventListener("blocked",e=>s(e.oldVersion,e.newVersion,e)),_.then(e=>{h&&e.addEventListener("close",()=>h()),l&&e.addEventListener("versionchange",e=>l(e.oldVersion,e.newVersion,e))}).catch(()=>{}),_}("firebase-heartbeat-database",1,{upgrade:(e,i)=>{if(0===i)try{e.createObjectStore(Oe)}catch(s){}}}).catch(e=>{throw ke.create("idb-open",{originalErrorMessage:e.message})})),Me}async function writeHeartbeatsToIndexedDB(e,i){try{const s=(await getDbPromise()).transaction(Oe,"readwrite"),o=s.objectStore(Oe);await o.put(i,computeKey(e)),await s.done}catch(s){if(s instanceof FirebaseError)ee.warn(s.message);else{const e=ke.create("idb-set",{originalErrorMessage:null==s?void 0:s.message});ee.warn(e.message)}}}function computeKey(e){return`${e.name}!${e.options.appId}`}
/**
 * @license
 * Copyright 2021 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class HeartbeatServiceImpl{constructor(e){this.container=e,this._heartbeatsCache=null;const i=this.container.getProvider("app").getImmediate();this._storage=new HeartbeatStorageImpl(i),this._heartbeatsCachePromise=this._storage.read().then(e=>(this._heartbeatsCache=e,e))}async triggerHeartbeat(){var e,i;try{const s=this.container.getProvider("platform-logger").getImmediate().getPlatformInfoString(),o=getUTCDateString();if(null==(null===(e=this._heartbeatsCache)||void 0===e?void 0:e.heartbeats)&&(this._heartbeatsCache=await this._heartbeatsCachePromise,null==(null===(i=this._heartbeatsCache)||void 0===i?void 0:i.heartbeats)))return;if(this._heartbeatsCache.lastSentHeartbeatDate===o||this._heartbeatsCache.heartbeats.some(e=>e.date===o))return;return this._heartbeatsCache.heartbeats.push({date:o,agent:s}),this._heartbeatsCache.heartbeats=this._heartbeatsCache.heartbeats.filter(e=>{const i=new Date(e.date).valueOf();return Date.now()-i<=2592e6}),this._storage.overwrite(this._heartbeatsCache)}catch(s){ee.warn(s)}}async getHeartbeatsHeader(){var e;try{if(null===this._heartbeatsCache&&await this._heartbeatsCachePromise,null==(null===(e=this._heartbeatsCache)||void 0===e?void 0:e.heartbeats)||0===this._heartbeatsCache.heartbeats.length)return"";const i=getUTCDateString(),{heartbeatsToSend:s,unsentEntries:o}=function(e,i=1024){const s=[];let o=e.slice();for(const l of e){const e=s.find(e=>e.agent===l.agent);if(e){if(e.dates.push(l.date),countBytes(s)>i){e.dates.pop();break}}else if(s.push({agent:l.agent,dates:[l.date]}),countBytes(s)>i){s.pop();break}o=o.slice(1)}return{heartbeatsToSend:s,unsentEntries:o}}(this._heartbeatsCache.heartbeats),l=base64urlEncodeWithoutPadding(JSON.stringify({version:2,heartbeats:s}));return this._heartbeatsCache.lastSentHeartbeatDate=i,o.length>0?(this._heartbeatsCache.heartbeats=o,await this._storage.overwrite(this._heartbeatsCache)):(this._heartbeatsCache.heartbeats=[],this._storage.overwrite(this._heartbeatsCache)),l}catch(i){return ee.warn(i),""}}}function getUTCDateString(){return(new Date).toISOString().substring(0,10)}class HeartbeatStorageImpl{constructor(e){this.app=e,this._canUseIndexedDBPromise=this.runIndexedDBEnvironmentCheck()}async runIndexedDBEnvironmentCheck(){return!!function(){try{return"object"==typeof indexedDB}catch(e){return!1}}()&&new Promise((e,i)=>{try{let s=!0;const o="validate-browser-context-for-indexeddb-analytics-module",l=self.indexedDB.open(o);l.onsuccess=()=>{l.result.close(),s||self.indexedDB.deleteDatabase(o),e(!0)},l.onupgradeneeded=()=>{s=!1},l.onerror=()=>{var e;i((null===(e=l.error)||void 0===e?void 0:e.message)||"")}}catch(s){i(s)}}).then(()=>!0).catch(()=>!1)}async read(){if(await this._canUseIndexedDBPromise){const e=await async function(e){try{const i=(await getDbPromise()).transaction(Oe),s=await i.objectStore(Oe).get(computeKey(e));return await i.done,s}catch(i){if(i instanceof FirebaseError)ee.warn(i.message);else{const e=ke.create("idb-get",{originalErrorMessage:null==i?void 0:i.message});ee.warn(e.message)}}}(this.app);return(null==e?void 0:e.heartbeats)?e:{heartbeats:[]}}return{heartbeats:[]}}async overwrite(e){var i;if(await this._canUseIndexedDBPromise){const s=await this.read();return writeHeartbeatsToIndexedDB(this.app,{lastSentHeartbeatDate:null!==(i=e.lastSentHeartbeatDate)&&void 0!==i?i:s.lastSentHeartbeatDate,heartbeats:e.heartbeats})}}async add(e){var i;if(await this._canUseIndexedDBPromise){const s=await this.read();return writeHeartbeatsToIndexedDB(this.app,{lastSentHeartbeatDate:null!==(i=e.lastSentHeartbeatDate)&&void 0!==i?i:s.lastSentHeartbeatDate,heartbeats:[...s.heartbeats,...e.heartbeats]})}}}function countBytes(e){return base64urlEncodeWithoutPadding(JSON.stringify({version:2,heartbeats:e})).length}
/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */var Fe;Fe="",_registerComponent(new Component("platform-logger",e=>new PlatformLoggerServiceImpl(e),"PRIVATE")),_registerComponent(new Component("heartbeat",e=>new HeartbeatServiceImpl(e),"PRIVATE")),registerVersion(j,$,Fe),registerVersion(j,$,"esm2017"),registerVersion("fire-js","");function __rest(e,i){var s={};for(var o in e)Object.prototype.hasOwnProperty.call(e,o)&&i.indexOf(o)<0&&(s[o]=e[o]);if(null!=e&&"function"==typeof Object.getOwnPropertySymbols){var l=0;for(o=Object.getOwnPropertySymbols(e);l<o.length;l++)i.indexOf(o[l])<0&&Object.prototype.propertyIsEnumerable.call(e,o[l])&&(s[o[l]]=e[o[l]])}return s}function __awaiter(e,i,s,o){return new(s||(s=Promise))(function(l,h){function fulfilled(e){try{step(o.next(e))}catch(i){h(i)}}function rejected(e){try{step(o.throw(e))}catch(i){h(i)}}function step(e){var i;e.done?l(e.value):(i=e.value,i instanceof s?i:new s(function(e){e(i)})).then(fulfilled,rejected)}step((o=o.apply(e,i||[])).next())})}function _prodErrorMap(){return{"dependent-sdk-initialized-before-auth":"Another Firebase SDK was initialized and is trying to use Auth before Auth is initialized. Please be sure to call `initializeAuth` or `getAuth` before starting any other Firebase SDK."}}
/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
registerVersion("firebase","10.14.1","app"),"function"==typeof SuppressedError&&SuppressedError;const Le=_prodErrorMap,Ue=new ErrorFactory("auth","Firebase",{"dependent-sdk-initialized-before-auth":"Another Firebase SDK was initialized and is trying to use Auth before Auth is initialized. Please be sure to call `initializeAuth` or `getAuth` before starting any other Firebase SDK."}),xe=new Logger("@firebase/auth");function _logError(e,...i){xe.logLevel<=o.ERROR&&xe.error(`Auth (${Ne}): ${e}`,...i)}
/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function _fail(e,...i){throw createErrorInternal(e,...i)}function _createError(e,...i){return createErrorInternal(e,...i)}function _errorWithCustomMessage(e,i,s){const o=Object.assign(Object.assign({},Le()),{[i]:s});return new ErrorFactory("auth","Firebase",o).create(i,{appName:e.name})}function _serverAppCurrentUserOperationNotSupportedError(e){return _errorWithCustomMessage(e,"operation-not-supported-in-this-environment","Operations that alter the current user are not supported in conjunction with FirebaseServerApp")}function _assertInstanceOf(e,i,s){if(!(i instanceof s))throw s.name!==i.constructor.name&&_fail(e,"argument-error"),_errorWithCustomMessage(e,"argument-error",`Type of ${i.constructor.name} does not match expected instance.Did you pass a reference from a different Auth SDK?`)}function createErrorInternal(e,...i){if("string"!=typeof e){const s=i[0],o=[...i.slice(1)];return o[0]&&(o[0].appName=e.name),e._errorFactory.create(s,...o)}return Ue.create(e,...i)}function _assert(e,i,...s){if(!e)throw createErrorInternal(i,...s)}function debugFail(e){const i="INTERNAL ASSERTION FAILED: "+e;throw _logError(i),new Error(i)}function debugAssert(e,i){e||debugFail(i)}
/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function _getCurrentUrl(){var e;return"undefined"!=typeof self&&(null===(e=self.location)||void 0===e?void 0:e.href)||""}function _getCurrentScheme(){var e;return"undefined"!=typeof self&&(null===(e=self.location)||void 0===e?void 0:e.protocol)||null}
/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function _isOnline(){return"undefined"==typeof navigator||!navigator||!("onLine"in navigator)||"boolean"!=typeof navigator.onLine||"http:"!==_getCurrentScheme()&&"https:"!==_getCurrentScheme()&&!function(){const e="object"==typeof chrome?chrome.runtime:"object"==typeof browser?browser.runtime:void 0;return"object"==typeof e&&void 0!==e.id}()&&!("connection"in navigator)||navigator.onLine}
/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
class Delay{constructor(e,i){this.shortDelay=e,this.longDelay=i,debugAssert(i>e,"Short delay should be less than long delay!"),this.isMobile="undefined"!=typeof window&&!!(window.cordova||window.phonegap||window.PhoneGap)&&/ios|iphone|ipod|ipad|android|blackberry|iemobile/i.test(getUA())||"object"==typeof navigator&&"ReactNative"===navigator.product}get(){return _isOnline()?this.isMobile?this.longDelay:this.shortDelay:Math.min(5e3,this.shortDelay)}}
/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function _emulatorUrl(e,i){debugAssert(e.emulator,"Emulator should always be set here");const{url:s}=e.emulator;return i?`${s}${i.startsWith("/")?i.slice(1):i}`:s}
/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class FetchProvider{static initialize(e,i,s){this.fetchImpl=e,i&&(this.headersImpl=i),s&&(this.responseImpl=s)}static fetch(){return this.fetchImpl?this.fetchImpl:"undefined"!=typeof self&&"fetch"in self?self.fetch:"undefined"!=typeof globalThis&&globalThis.fetch?globalThis.fetch:"undefined"!=typeof fetch?fetch:void debugFail("Could not find fetch implementation, make sure you call FetchProvider.initialize() with an appropriate polyfill")}static headers(){return this.headersImpl?this.headersImpl:"undefined"!=typeof self&&"Headers"in self?self.Headers:"undefined"!=typeof globalThis&&globalThis.Headers?globalThis.Headers:"undefined"!=typeof Headers?Headers:void debugFail("Could not find Headers implementation, make sure you call FetchProvider.initialize() with an appropriate polyfill")}static response(){return this.responseImpl?this.responseImpl:"undefined"!=typeof self&&"Response"in self?self.Response:"undefined"!=typeof globalThis&&globalThis.Response?globalThis.Response:"undefined"!=typeof Response?Response:void debugFail("Could not find Response implementation, make sure you call FetchProvider.initialize() with an appropriate polyfill")}}
/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Be={CREDENTIAL_MISMATCH:"custom-token-mismatch",MISSING_CUSTOM_TOKEN:"internal-error",INVALID_IDENTIFIER:"invalid-email",MISSING_CONTINUE_URI:"internal-error",INVALID_PASSWORD:"wrong-password",MISSING_PASSWORD:"missing-password",INVALID_LOGIN_CREDENTIALS:"invalid-credential",EMAIL_EXISTS:"email-already-in-use",PASSWORD_LOGIN_DISABLED:"operation-not-allowed",INVALID_IDP_RESPONSE:"invalid-credential",INVALID_PENDING_TOKEN:"invalid-credential",FEDERATED_USER_ID_ALREADY_LINKED:"credential-already-in-use",MISSING_REQ_TYPE:"internal-error",EMAIL_NOT_FOUND:"user-not-found",RESET_PASSWORD_EXCEED_LIMIT:"too-many-requests",EXPIRED_OOB_CODE:"expired-action-code",INVALID_OOB_CODE:"invalid-action-code",MISSING_OOB_CODE:"internal-error",CREDENTIAL_TOO_OLD_LOGIN_AGAIN:"requires-recent-login",INVALID_ID_TOKEN:"invalid-user-token",TOKEN_EXPIRED:"user-token-expired",USER_NOT_FOUND:"user-token-expired",TOO_MANY_ATTEMPTS_TRY_LATER:"too-many-requests",PASSWORD_DOES_NOT_MEET_REQUIREMENTS:"password-does-not-meet-requirements",INVALID_CODE:"invalid-verification-code",INVALID_SESSION_INFO:"invalid-verification-id",INVALID_TEMPORARY_PROOF:"invalid-credential",MISSING_SESSION_INFO:"missing-verification-id",SESSION_EXPIRED:"code-expired",MISSING_ANDROID_PACKAGE_NAME:"missing-android-pkg-name",UNAUTHORIZED_DOMAIN:"unauthorized-continue-uri",INVALID_OAUTH_CLIENT_ID:"invalid-oauth-client-id",ADMIN_ONLY_OPERATION:"admin-restricted-operation",INVALID_MFA_PENDING_CREDENTIAL:"invalid-multi-factor-session",MFA_ENROLLMENT_NOT_FOUND:"multi-factor-info-not-found",MISSING_MFA_ENROLLMENT_ID:"missing-multi-factor-info",MISSING_MFA_PENDING_CREDENTIAL:"missing-multi-factor-session",SECOND_FACTOR_EXISTS:"second-factor-already-in-use",SECOND_FACTOR_LIMIT_EXCEEDED:"maximum-second-factor-count-exceeded",BLOCKING_FUNCTION_ERROR_RESPONSE:"internal-error",RECAPTCHA_NOT_ENABLED:"recaptcha-not-enabled",MISSING_RECAPTCHA_TOKEN:"missing-recaptcha-token",INVALID_RECAPTCHA_TOKEN:"invalid-recaptcha-token",INVALID_RECAPTCHA_ACTION:"invalid-recaptcha-action",MISSING_CLIENT_TYPE:"missing-client-type",MISSING_RECAPTCHA_VERSION:"missing-recaptcha-version",INVALID_RECAPTCHA_VERSION:"invalid-recaptcha-version",INVALID_REQ_TYPE:"invalid-req-type"},qe=new Delay(3e4,6e4);
/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function _addTidIfNecessary(e,i){return e.tenantId&&!i.tenantId?Object.assign(Object.assign({},i),{tenantId:e.tenantId}):i}async function _performApiRequest(e,i,s,o,l={}){return _performFetchWithErrorHandling(e,l,async()=>{let l={},h={};o&&("GET"===i?h=o:l={body:JSON.stringify(o)});const d=querystring(Object.assign({key:e.config.apiKey},h)).slice(1),_=await e._getAdditionalHeaders();_["Content-Type"]="application/json",e.languageCode&&(_["X-Firebase-Locale"]=e.languageCode);const f=Object.assign({method:i,headers:_},l);return"undefined"!=typeof navigator&&"Cloudflare-Workers"===navigator.userAgent||(f.referrerPolicy="no-referrer"),FetchProvider.fetch()(_getFinalTarget(e,e.config.apiHost,s,d),f)})}async function _performFetchWithErrorHandling(e,i,s){e._canInitEmulator=!1;const o=Object.assign(Object.assign({},Be),i);try{const i=new NetworkTimeout(e),l=await Promise.race([s(),i.promise]);i.clearNetworkTimeout();const h=await l.json();if("needConfirmation"in h)throw _makeTaggedError(e,"account-exists-with-different-credential",h);if(l.ok&&!("errorMessage"in h))return h;{const i=l.ok?h.errorMessage:h.error.message,[s,d]=i.split(" : ");if("FEDERATED_USER_ID_ALREADY_LINKED"===s)throw _makeTaggedError(e,"credential-already-in-use",h);if("EMAIL_EXISTS"===s)throw _makeTaggedError(e,"email-already-in-use",h);if("USER_DISABLED"===s)throw _makeTaggedError(e,"user-disabled",h);const _=o[s]||s.toLowerCase().replace(/[_\s]+/g,"-");if(d)throw _errorWithCustomMessage(e,_,d);_fail(e,_)}}catch(l){if(l instanceof FirebaseError)throw l;_fail(e,"network-request-failed",{message:String(l)})}}async function _performSignInRequest(e,i,s,o,l={}){const h=await _performApiRequest(e,i,s,o,l);return"mfaPendingCredential"in h&&_fail(e,"multi-factor-auth-required",{_serverResponse:h}),h}function _getFinalTarget(e,i,s,o){const l=`${i}${s}?${o}`;return e.config.emulator?_emulatorUrl(e.config,l):`${e.config.apiScheme}://${l}`}function _parseEnforcementState(e){switch(e){case"ENFORCE":return"ENFORCE";case"AUDIT":return"AUDIT";case"OFF":return"OFF";default:return"ENFORCEMENT_STATE_UNSPECIFIED"}}class NetworkTimeout{constructor(e){this.auth=e,this.timer=null,this.promise=new Promise((e,i)=>{this.timer=setTimeout(()=>i(_createError(this.auth,"network-request-failed")),qe.get())})}clearNetworkTimeout(){clearTimeout(this.timer)}}function _makeTaggedError(e,i,s){const o={appName:e.name};s.email&&(o.email=s.email),s.phoneNumber&&(o.phoneNumber=s.phoneNumber);const l=_createError(e,i,o);return l.customData._tokenResponse=s,l}function isEnterprise(e){return void 0!==e&&void 0!==e.enterprise}class RecaptchaConfig{constructor(e){if(this.siteKey="",this.recaptchaEnforcementState=[],void 0===e.recaptchaKey)throw new Error("recaptchaKey undefined");this.siteKey=e.recaptchaKey.split("/")[3],this.recaptchaEnforcementState=e.recaptchaEnforcementState}getProviderEnforcementState(e){if(!this.recaptchaEnforcementState||0===this.recaptchaEnforcementState.length)return null;for(const i of this.recaptchaEnforcementState)if(i.provider&&i.provider===e)return _parseEnforcementState(i.enforcementState);return null}isProviderEnabled(e){return"ENFORCE"===this.getProviderEnforcementState(e)||"AUDIT"===this.getProviderEnforcementState(e)}}async function getAccountInfo(e,i){return _performApiRequest(e,"POST","/v1/accounts:lookup",i)}
/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function utcTimestampToDateString(e){if(e)try{const i=new Date(Number(e));if(!isNaN(i.getTime()))return i.toUTCString()}catch(i){}}function secondsStringToMilliseconds(e){return 1e3*Number(e)}function _parseToken(e){const[i,s,o]=e.split(".");if(void 0===i||void 0===s||void 0===o)return _logError("JWT malformed, contained fewer than 3 sections"),null;try{const e=base64Decode(s);return e?JSON.parse(e):(_logError("Failed to decode base64 JWT payload"),null)}catch(l){return _logError("Caught error parsing JWT payload as JSON",null==l?void 0:l.toString()),null}}function _tokenExpiresIn(e){const i=_parseToken(e);return _assert(i,"internal-error"),_assert(void 0!==i.exp,"internal-error"),_assert(void 0!==i.iat,"internal-error"),Number(i.exp)-Number(i.iat)}
/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function _logoutIfInvalidated(e,i,s=!1){if(s)return i;try{return await i}catch(o){throw o instanceof FirebaseError&&function({code:e}){return"auth/user-disabled"===e||"auth/user-token-expired"===e}
/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */(o)&&e.auth.currentUser===e&&await e.auth.signOut(),o}}class ProactiveRefresh{constructor(e){this.user=e,this.isRunning=!1,this.timerId=null,this.errorBackoff=3e4}_start(){this.isRunning||(this.isRunning=!0,this.schedule())}_stop(){this.isRunning&&(this.isRunning=!1,null!==this.timerId&&clearTimeout(this.timerId))}getInterval(e){var i;if(e){const e=this.errorBackoff;return this.errorBackoff=Math.min(2*this.errorBackoff,96e4),e}{this.errorBackoff=3e4;const e=(null!==(i=this.user.stsTokenManager.expirationTime)&&void 0!==i?i:0)-Date.now()-3e5;return Math.max(0,e)}}schedule(e=!1){if(!this.isRunning)return;const i=this.getInterval(e);this.timerId=setTimeout(async()=>{await this.iteration()},i)}async iteration(){try{await this.user.getIdToken(!0)}catch(e){return void("auth/network-request-failed"===(null==e?void 0:e.code)&&this.schedule(!0))}this.schedule()}}
/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class UserMetadata{constructor(e,i){this.createdAt=e,this.lastLoginAt=i,this._initializeTime()}_initializeTime(){this.lastSignInTime=utcTimestampToDateString(this.lastLoginAt),this.creationTime=utcTimestampToDateString(this.createdAt)}_copy(e){this.createdAt=e.createdAt,this.lastLoginAt=e.lastLoginAt,this._initializeTime()}toJSON(){return{createdAt:this.createdAt,lastLoginAt:this.lastLoginAt}}}
/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function _reloadWithoutSaving(e){var i;const s=e.auth,o=await e.getIdToken(),l=await _logoutIfInvalidated(e,getAccountInfo(s,{idToken:o}));_assert(null==l?void 0:l.users.length,s,"internal-error");const h=l.users[0];e._notifyReloadListener(h);const d=(null===(i=h.providerUserInfo)||void 0===i?void 0:i.length)?extractProviderData(h.providerUserInfo):[],_=(f=e.providerData,g=d,[...f.filter(e=>!g.some(i=>i.providerId===e.providerId)),...g]);var f,g;const v=e.isAnonymous,w=!(e.email&&h.passwordHash||(null==_?void 0:_.length)),b=!!v&&w,S={uid:h.localId,displayName:h.displayName||null,photoURL:h.photoUrl||null,email:h.email||null,emailVerified:h.emailVerified||!1,phoneNumber:h.phoneNumber||null,tenantId:h.tenantId||null,providerData:_,metadata:new UserMetadata(h.createdAt,h.lastLoginAt),isAnonymous:b};Object.assign(e,S)}function extractProviderData(e){return e.map(e=>{var{providerId:i}=e,s=__rest(e,["providerId"]);return{providerId:i,uid:s.rawId||"",displayName:s.displayName||null,email:s.email||null,phoneNumber:s.phoneNumber||null,photoURL:s.photoUrl||null}})}
/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
class StsTokenManager{constructor(){this.refreshToken=null,this.accessToken=null,this.expirationTime=null}get isExpired(){return!this.expirationTime||Date.now()>this.expirationTime-3e4}updateFromServerResponse(e){_assert(e.idToken,"internal-error"),_assert(void 0!==e.idToken,"internal-error"),_assert(void 0!==e.refreshToken,"internal-error");const i="expiresIn"in e&&void 0!==e.expiresIn?Number(e.expiresIn):_tokenExpiresIn(e.idToken);this.updateTokensAndExpiration(e.idToken,e.refreshToken,i)}updateFromIdToken(e){_assert(0!==e.length,"internal-error");const i=_tokenExpiresIn(e);this.updateTokensAndExpiration(e,null,i)}async getToken(e,i=!1){return i||!this.accessToken||this.isExpired?(_assert(this.refreshToken,e,"user-token-expired"),this.refreshToken?(await this.refresh(e,this.refreshToken),this.accessToken):null):this.accessToken}clearRefreshToken(){this.refreshToken=null}async refresh(e,i){const{accessToken:s,refreshToken:o,expiresIn:l}=await async function(e,i){const s=await _performFetchWithErrorHandling(e,{},async()=>{const s=querystring({grant_type:"refresh_token",refresh_token:i}).slice(1),{tokenApiHost:o,apiKey:l}=e.config,h=_getFinalTarget(e,o,"/v1/token",`key=${l}`),d=await e._getAdditionalHeaders();return d["Content-Type"]="application/x-www-form-urlencoded",FetchProvider.fetch()(h,{method:"POST",headers:d,body:s})});return{accessToken:s.access_token,expiresIn:s.expires_in,refreshToken:s.refresh_token}}(e,i);this.updateTokensAndExpiration(s,o,Number(l))}updateTokensAndExpiration(e,i,s){this.refreshToken=i||null,this.accessToken=e||null,this.expirationTime=Date.now()+1e3*s}static fromJSON(e,i){const{refreshToken:s,accessToken:o,expirationTime:l}=i,h=new StsTokenManager;return s&&(_assert("string"==typeof s,"internal-error",{appName:e}),h.refreshToken=s),o&&(_assert("string"==typeof o,"internal-error",{appName:e}),h.accessToken=o),l&&(_assert("number"==typeof l,"internal-error",{appName:e}),h.expirationTime=l),h}toJSON(){return{refreshToken:this.refreshToken,accessToken:this.accessToken,expirationTime:this.expirationTime}}_assign(e){this.accessToken=e.accessToken,this.refreshToken=e.refreshToken,this.expirationTime=e.expirationTime}_clone(){return Object.assign(new StsTokenManager,this.toJSON())}_performRefresh(){return debugFail("not implemented")}}
/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function assertStringOrUndefined(e,i){_assert("string"==typeof e||void 0===e,"internal-error",{appName:i})}class UserImpl{constructor(e){var{uid:i,auth:s,stsTokenManager:o}=e,l=__rest(e,["uid","auth","stsTokenManager"]);this.providerId="firebase",this.proactiveRefresh=new ProactiveRefresh(this),this.reloadUserInfo=null,this.reloadListener=null,this.uid=i,this.auth=s,this.stsTokenManager=o,this.accessToken=o.accessToken,this.displayName=l.displayName||null,this.email=l.email||null,this.emailVerified=l.emailVerified||!1,this.phoneNumber=l.phoneNumber||null,this.photoURL=l.photoURL||null,this.isAnonymous=l.isAnonymous||!1,this.tenantId=l.tenantId||null,this.providerData=l.providerData?[...l.providerData]:[],this.metadata=new UserMetadata(l.createdAt||void 0,l.lastLoginAt||void 0)}async getIdToken(e){const i=await _logoutIfInvalidated(this,this.stsTokenManager.getToken(this.auth,e));return _assert(i,this.auth,"internal-error"),this.accessToken!==i&&(this.accessToken=i,await this.auth._persistUserIfCurrent(this),this.auth._notifyListenersIfCurrent(this)),i}getIdTokenResult(e){return async function(e,i=!1){const s=getModularInstance(e),o=await s.getIdToken(i),l=_parseToken(o);_assert(l&&l.exp&&l.auth_time&&l.iat,s.auth,"internal-error");const h="object"==typeof l.firebase?l.firebase:void 0,d=null==h?void 0:h.sign_in_provider;return{claims:l,token:o,authTime:utcTimestampToDateString(secondsStringToMilliseconds(l.auth_time)),issuedAtTime:utcTimestampToDateString(secondsStringToMilliseconds(l.iat)),expirationTime:utcTimestampToDateString(secondsStringToMilliseconds(l.exp)),signInProvider:d||null,signInSecondFactor:(null==h?void 0:h.sign_in_second_factor)||null}}(this,e)}reload(){return async function(e){const i=getModularInstance(e);await _reloadWithoutSaving(i),await i.auth._persistUserIfCurrent(i),i.auth._notifyListenersIfCurrent(i)}(this)}_assign(e){this!==e&&(_assert(this.uid===e.uid,this.auth,"internal-error"),this.displayName=e.displayName,this.photoURL=e.photoURL,this.email=e.email,this.emailVerified=e.emailVerified,this.phoneNumber=e.phoneNumber,this.isAnonymous=e.isAnonymous,this.tenantId=e.tenantId,this.providerData=e.providerData.map(e=>Object.assign({},e)),this.metadata._copy(e.metadata),this.stsTokenManager._assign(e.stsTokenManager))}_clone(e){const i=new UserImpl(Object.assign(Object.assign({},this),{auth:e,stsTokenManager:this.stsTokenManager._clone()}));return i.metadata._copy(this.metadata),i}_onReload(e){_assert(!this.reloadListener,this.auth,"internal-error"),this.reloadListener=e,this.reloadUserInfo&&(this._notifyReloadListener(this.reloadUserInfo),this.reloadUserInfo=null)}_notifyReloadListener(e){this.reloadListener?this.reloadListener(e):this.reloadUserInfo=e}_startProactiveRefresh(){this.proactiveRefresh._start()}_stopProactiveRefresh(){this.proactiveRefresh._stop()}async _updateTokensIfNecessary(e,i=!1){let s=!1;e.idToken&&e.idToken!==this.stsTokenManager.accessToken&&(this.stsTokenManager.updateFromServerResponse(e),s=!0),i&&await _reloadWithoutSaving(this),await this.auth._persistUserIfCurrent(this),s&&this.auth._notifyListenersIfCurrent(this)}async delete(){if(_isFirebaseServerApp(this.auth.app))return Promise.reject(_serverAppCurrentUserOperationNotSupportedError(this.auth));const e=await this.getIdToken();return await _logoutIfInvalidated(this,
/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
async function(e,i){return _performApiRequest(e,"POST","/v1/accounts:delete",i)}(this.auth,{idToken:e})),this.stsTokenManager.clearRefreshToken(),this.auth.signOut()}toJSON(){return Object.assign(Object.assign({uid:this.uid,email:this.email||void 0,emailVerified:this.emailVerified,displayName:this.displayName||void 0,isAnonymous:this.isAnonymous,photoURL:this.photoURL||void 0,phoneNumber:this.phoneNumber||void 0,tenantId:this.tenantId||void 0,providerData:this.providerData.map(e=>Object.assign({},e)),stsTokenManager:this.stsTokenManager.toJSON(),_redirectEventId:this._redirectEventId},this.metadata.toJSON()),{apiKey:this.auth.config.apiKey,appName:this.auth.name})}get refreshToken(){return this.stsTokenManager.refreshToken||""}static _fromJSON(e,i){var s,o,l,h,d,_,f,g;const v=null!==(s=i.displayName)&&void 0!==s?s:void 0,w=null!==(o=i.email)&&void 0!==o?o:void 0,b=null!==(l=i.phoneNumber)&&void 0!==l?l:void 0,S=null!==(h=i.photoURL)&&void 0!==h?h:void 0,C=null!==(d=i.tenantId)&&void 0!==d?d:void 0,D=null!==(_=i._redirectEventId)&&void 0!==_?_:void 0,k=null!==(f=i.createdAt)&&void 0!==f?f:void 0,O=null!==(g=i.lastLoginAt)&&void 0!==g?g:void 0,{uid:q,emailVerified:j,isAnonymous:$,providerData:ee,stsTokenManager:te}=i;_assert(q&&te,e,"internal-error");const re=StsTokenManager.fromJSON(this.name,te);_assert("string"==typeof q,e,"internal-error"),assertStringOrUndefined(v,e.name),assertStringOrUndefined(w,e.name),_assert("boolean"==typeof j,e,"internal-error"),_assert("boolean"==typeof $,e,"internal-error"),assertStringOrUndefined(b,e.name),assertStringOrUndefined(S,e.name),assertStringOrUndefined(C,e.name),assertStringOrUndefined(D,e.name),assertStringOrUndefined(k,e.name),assertStringOrUndefined(O,e.name);const ne=new UserImpl({uid:q,auth:e,email:w,emailVerified:j,displayName:v,isAnonymous:$,photoURL:S,phoneNumber:b,tenantId:C,stsTokenManager:re,createdAt:k,lastLoginAt:O});return ee&&Array.isArray(ee)&&(ne.providerData=ee.map(e=>Object.assign({},e))),D&&(ne._redirectEventId=D),ne}static async _fromIdTokenResponse(e,i,s=!1){const o=new StsTokenManager;o.updateFromServerResponse(i);const l=new UserImpl({uid:i.localId,auth:e,stsTokenManager:o,isAnonymous:s});return await _reloadWithoutSaving(l),l}static async _fromGetAccountInfoResponse(e,i,s){const o=i.users[0];_assert(void 0!==o.localId,"internal-error");const l=void 0!==o.providerUserInfo?extractProviderData(o.providerUserInfo):[],h=!(o.email&&o.passwordHash||(null==l?void 0:l.length)),d=new StsTokenManager;d.updateFromIdToken(s);const _=new UserImpl({uid:o.localId,auth:e,stsTokenManager:d,isAnonymous:h}),f={uid:o.localId,displayName:o.displayName||null,photoURL:o.photoUrl||null,email:o.email||null,emailVerified:o.emailVerified||!1,phoneNumber:o.phoneNumber||null,tenantId:o.tenantId||null,providerData:l,metadata:new UserMetadata(o.createdAt,o.lastLoginAt),isAnonymous:!(o.email&&o.passwordHash||(null==l?void 0:l.length))};return Object.assign(_,f),_}}
/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const je=new Map;function _getInstance(e){debugAssert(e instanceof Function,"Expected a class definition");let i=je.get(e);return i?(debugAssert(i instanceof e,"Instance stored in cache mismatched with class"),i):(i=new e,je.set(e,i),i)}
/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class InMemoryPersistence{constructor(){this.type="NONE",this.storage={}}async _isAvailable(){return!0}async _set(e,i){this.storage[e]=i}async _get(e){const i=this.storage[e];return void 0===i?null:i}async _remove(e){delete this.storage[e]}_addListener(e,i){}_removeListener(e,i){}}InMemoryPersistence.type="NONE";const Ke=InMemoryPersistence;
/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function _persistenceKeyName(e,i,s){return`firebase:${e}:${i}:${s}`}class PersistenceUserManager{constructor(e,i,s){this.persistence=e,this.auth=i,this.userKey=s;const{config:o,name:l}=this.auth;this.fullUserKey=_persistenceKeyName(this.userKey,o.apiKey,l),this.fullPersistenceKey=_persistenceKeyName("persistence",o.apiKey,l),this.boundEventHandler=i._onStorageEvent.bind(i),this.persistence._addListener(this.fullUserKey,this.boundEventHandler)}setCurrentUser(e){return this.persistence._set(this.fullUserKey,e.toJSON())}async getCurrentUser(){const e=await this.persistence._get(this.fullUserKey);return e?UserImpl._fromJSON(this.auth,e):null}removeCurrentUser(){return this.persistence._remove(this.fullUserKey)}savePersistenceForRedirect(){return this.persistence._set(this.fullPersistenceKey,this.persistence.type)}async setPersistence(e){if(this.persistence===e)return;const i=await this.getCurrentUser();return await this.removeCurrentUser(),this.persistence=e,i?this.setCurrentUser(i):void 0}delete(){this.persistence._removeListener(this.fullUserKey,this.boundEventHandler)}static async create(e,i,s="authUser"){if(!i.length)return new PersistenceUserManager(_getInstance(Ke),e,s);const o=(await Promise.all(i.map(async e=>{if(await e._isAvailable())return e}))).filter(e=>e);let l=o[0]||_getInstance(Ke);const h=_persistenceKeyName(s,e.config.apiKey,e.name);let d=null;for(const g of i)try{const i=await g._get(h);if(i){const s=UserImpl._fromJSON(e,i);g!==l&&(d=s),l=g;break}}catch(f){}const _=o.filter(e=>e._shouldAllowMigration);return l._shouldAllowMigration&&_.length?(l=_[0],d&&await l._set(h,d.toJSON()),await Promise.all(i.map(async e=>{if(e!==l)try{await e._remove(h)}catch(f){}})),new PersistenceUserManager(l,e,s)):new PersistenceUserManager(l,e,s)}}
/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function _getBrowserName(e){const i=e.toLowerCase();if(i.includes("opera/")||i.includes("opr/")||i.includes("opios/"))return"Opera";if(_isIEMobile(i))return"IEMobile";if(i.includes("msie")||i.includes("trident/"))return"IE";if(i.includes("edge/"))return"Edge";if(_isFirefox(i))return"Firefox";if(i.includes("silk/"))return"Silk";if(_isBlackBerry(i))return"Blackberry";if(_isWebOS(i))return"Webos";if(_isSafari(i))return"Safari";if((i.includes("chrome/")||_isChromeIOS(i))&&!i.includes("edge/"))return"Chrome";if(_isAndroid(i))return"Android";{const i=/([a-zA-Z\d\.]+)\/[a-zA-Z\d\.]*$/,s=e.match(i);if(2===(null==s?void 0:s.length))return s[1]}return"Other"}function _isFirefox(e=getUA()){return/firefox\//i.test(e)}function _isSafari(e=getUA()){const i=e.toLowerCase();return i.includes("safari/")&&!i.includes("chrome/")&&!i.includes("crios/")&&!i.includes("android")}function _isChromeIOS(e=getUA()){return/crios\//i.test(e)}function _isIEMobile(e=getUA()){return/iemobile/i.test(e)}function _isAndroid(e=getUA()){return/android/i.test(e)}function _isBlackBerry(e=getUA()){return/blackberry/i.test(e)}function _isWebOS(e=getUA()){return/webos/i.test(e)}function _isIOS(e=getUA()){return/iphone|ipad|ipod/i.test(e)||/macintosh/i.test(e)&&/mobile/i.test(e)}function _isIE10(){return function(){const e=getUA();return e.indexOf("MSIE ")>=0||e.indexOf("Trident/")>=0}()&&10===document.documentMode}function _isMobileBrowser(e=getUA()){return _isIOS(e)||_isAndroid(e)||_isWebOS(e)||_isBlackBerry(e)||/windows phone/i.test(e)||_isIEMobile(e)}
/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function _getClientVersion(e,i=[]){let s;switch(e){case"Browser":s=_getBrowserName(getUA());break;case"Worker":s=`${_getBrowserName(getUA())}-${e}`;break;default:s=e}const o=i.length?i.join(","):"FirebaseCore-web";return`${s}/JsCore/${Ne}/${o}`}
/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class AuthMiddlewareQueue{constructor(e){this.auth=e,this.queue=[]}pushCallback(e,i){const wrappedCallback=i=>new Promise((s,o)=>{try{s(e(i))}catch(l){o(l)}});wrappedCallback.onAbort=i,this.queue.push(wrappedCallback);const s=this.queue.length-1;return()=>{this.queue[s]=()=>Promise.resolve()}}async runMiddleware(e){if(this.auth.currentUser===e)return;const i=[];try{for(const s of this.queue)await s(e),s.onAbort&&i.push(s.onAbort)}catch(s){i.reverse();for(const e of i)try{e()}catch(o){}throw this.auth._errorFactory.create("login-blocked",{originalMessage:null==s?void 0:s.message})}}}
/**
 * @license
 * Copyright 2023 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class PasswordPolicyImpl{constructor(e){var i,s,o,l;const h=e.customStrengthOptions;this.customStrengthOptions={},this.customStrengthOptions.minPasswordLength=null!==(i=h.minPasswordLength)&&void 0!==i?i:6,h.maxPasswordLength&&(this.customStrengthOptions.maxPasswordLength=h.maxPasswordLength),void 0!==h.containsLowercaseCharacter&&(this.customStrengthOptions.containsLowercaseLetter=h.containsLowercaseCharacter),void 0!==h.containsUppercaseCharacter&&(this.customStrengthOptions.containsUppercaseLetter=h.containsUppercaseCharacter),void 0!==h.containsNumericCharacter&&(this.customStrengthOptions.containsNumericCharacter=h.containsNumericCharacter),void 0!==h.containsNonAlphanumericCharacter&&(this.customStrengthOptions.containsNonAlphanumericCharacter=h.containsNonAlphanumericCharacter),this.enforcementState=e.enforcementState,"ENFORCEMENT_STATE_UNSPECIFIED"===this.enforcementState&&(this.enforcementState="OFF"),this.allowedNonAlphanumericCharacters=null!==(o=null===(s=e.allowedNonAlphanumericCharacters)||void 0===s?void 0:s.join(""))&&void 0!==o?o:"",this.forceUpgradeOnSignin=null!==(l=e.forceUpgradeOnSignin)&&void 0!==l&&l,this.schemaVersion=e.schemaVersion}validatePassword(e){var i,s,o,l,h,d;const _={isValid:!0,passwordPolicy:this};return this.validatePasswordLengthOptions(e,_),this.validatePasswordCharacterOptions(e,_),_.isValid&&(_.isValid=null===(i=_.meetsMinPasswordLength)||void 0===i||i),_.isValid&&(_.isValid=null===(s=_.meetsMaxPasswordLength)||void 0===s||s),_.isValid&&(_.isValid=null===(o=_.containsLowercaseLetter)||void 0===o||o),_.isValid&&(_.isValid=null===(l=_.containsUppercaseLetter)||void 0===l||l),_.isValid&&(_.isValid=null===(h=_.containsNumericCharacter)||void 0===h||h),_.isValid&&(_.isValid=null===(d=_.containsNonAlphanumericCharacter)||void 0===d||d),_}validatePasswordLengthOptions(e,i){const s=this.customStrengthOptions.minPasswordLength,o=this.customStrengthOptions.maxPasswordLength;s&&(i.meetsMinPasswordLength=e.length>=s),o&&(i.meetsMaxPasswordLength=e.length<=o)}validatePasswordCharacterOptions(e,i){let s;this.updatePasswordCharacterOptionsStatuses(i,!1,!1,!1,!1);for(let o=0;o<e.length;o++)s=e.charAt(o),this.updatePasswordCharacterOptionsStatuses(i,s>="a"&&s<="z",s>="A"&&s<="Z",s>="0"&&s<="9",this.allowedNonAlphanumericCharacters.includes(s))}updatePasswordCharacterOptionsStatuses(e,i,s,o,l){this.customStrengthOptions.containsLowercaseLetter&&(e.containsLowercaseLetter||(e.containsLowercaseLetter=i)),this.customStrengthOptions.containsUppercaseLetter&&(e.containsUppercaseLetter||(e.containsUppercaseLetter=s)),this.customStrengthOptions.containsNumericCharacter&&(e.containsNumericCharacter||(e.containsNumericCharacter=o)),this.customStrengthOptions.containsNonAlphanumericCharacter&&(e.containsNonAlphanumericCharacter||(e.containsNonAlphanumericCharacter=l))}}
/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class AuthImpl{constructor(e,i,s,o){this.app=e,this.heartbeatServiceProvider=i,this.appCheckServiceProvider=s,this.config=o,this.currentUser=null,this.emulatorConfig=null,this.operations=Promise.resolve(),this.authStateSubscription=new Subscription(this),this.idTokenSubscription=new Subscription(this),this.beforeStateQueue=new AuthMiddlewareQueue(this),this.redirectUser=null,this.isProactiveRefreshEnabled=!1,this.EXPECTED_PASSWORD_POLICY_SCHEMA_VERSION=1,this._canInitEmulator=!0,this._isInitialized=!1,this._deleted=!1,this._initializationPromise=null,this._popupRedirectResolver=null,this._errorFactory=Ue,this._agentRecaptchaConfig=null,this._tenantRecaptchaConfigs={},this._projectPasswordPolicy=null,this._tenantPasswordPolicies={},this.lastNotifiedUid=void 0,this.languageCode=null,this.tenantId=null,this.settings={appVerificationDisabledForTesting:!1},this.frameworks=[],this.name=e.name,this.clientVersion=o.sdkClientVersion}_initializeWithPersistence(e,i){return i&&(this._popupRedirectResolver=_getInstance(i)),this._initializationPromise=this.queue(async()=>{var s,o;if(!this._deleted&&(this.persistenceManager=await PersistenceUserManager.create(this,e),!this._deleted)){if(null===(s=this._popupRedirectResolver)||void 0===s?void 0:s._shouldInitProactively)try{await this._popupRedirectResolver._initialize(this)}catch(l){}await this.initializeCurrentUser(i),this.lastNotifiedUid=(null===(o=this.currentUser)||void 0===o?void 0:o.uid)||null,this._deleted||(this._isInitialized=!0)}}),this._initializationPromise}async _onStorageEvent(){if(this._deleted)return;const e=await this.assertedPersistence.getCurrentUser();return this.currentUser||e?this.currentUser&&e&&this.currentUser.uid===e.uid?(this._currentUser._assign(e),void(await this.currentUser.getIdToken())):void(await this._updateCurrentUser(e,!0)):void 0}async initializeCurrentUserFromIdToken(e){try{const i=await getAccountInfo(this,{idToken:e}),s=await UserImpl._fromGetAccountInfoResponse(this,i,e);await this.directlySetCurrentUser(s)}catch(i){await this.directlySetCurrentUser(null)}}async initializeCurrentUser(e){var i;if(_isFirebaseServerApp(this.app)){const e=this.app.settings.authIdToken;return e?new Promise(i=>{setTimeout(()=>this.initializeCurrentUserFromIdToken(e).then(i,i))}):this.directlySetCurrentUser(null)}const s=await this.assertedPersistence.getCurrentUser();let o=s,l=!1;if(e&&this.config.authDomain){await this.getOrInitRedirectPersistenceManager();const s=null===(i=this.redirectUser)||void 0===i?void 0:i._redirectEventId,h=null==o?void 0:o._redirectEventId,d=await this.tryRedirectSignIn(e);s&&s!==h||!(null==d?void 0:d.user)||(o=d.user,l=!0)}if(!o)return this.directlySetCurrentUser(null);if(!o._redirectEventId){if(l)try{await this.beforeStateQueue.runMiddleware(o)}catch(h){o=s,this._popupRedirectResolver._overrideRedirectResult(this,()=>Promise.reject(h))}return o?this.reloadAndSetCurrentUserOrClear(o):this.directlySetCurrentUser(null)}return _assert(this._popupRedirectResolver,this,"argument-error"),await this.getOrInitRedirectPersistenceManager(),this.redirectUser&&this.redirectUser._redirectEventId===o._redirectEventId?this.directlySetCurrentUser(o):this.reloadAndSetCurrentUserOrClear(o)}async tryRedirectSignIn(e){let i=null;try{i=await this._popupRedirectResolver._completeRedirectFn(this,e,!0)}catch(s){await this._setRedirectUser(null)}return i}async reloadAndSetCurrentUserOrClear(e){try{await _reloadWithoutSaving(e)}catch(i){if("auth/network-request-failed"!==(null==i?void 0:i.code))return this.directlySetCurrentUser(null)}return this.directlySetCurrentUser(e)}useDeviceLanguage(){this.languageCode=function(){if("undefined"==typeof navigator)return null;const e=navigator;return e.languages&&e.languages[0]||e.language||null}()}async _delete(){this._deleted=!0}async updateCurrentUser(e){if(_isFirebaseServerApp(this.app))return Promise.reject(_serverAppCurrentUserOperationNotSupportedError(this));const i=e?getModularInstance(e):null;return i&&_assert(i.auth.config.apiKey===this.config.apiKey,this,"invalid-user-token"),this._updateCurrentUser(i&&i._clone(this))}async _updateCurrentUser(e,i=!1){if(!this._deleted)return e&&_assert(this.tenantId===e.tenantId,this,"tenant-id-mismatch"),i||await this.beforeStateQueue.runMiddleware(e),this.queue(async()=>{await this.directlySetCurrentUser(e),this.notifyAuthListeners()})}async signOut(){return _isFirebaseServerApp(this.app)?Promise.reject(_serverAppCurrentUserOperationNotSupportedError(this)):(await this.beforeStateQueue.runMiddleware(null),(this.redirectPersistenceManager||this._popupRedirectResolver)&&await this._setRedirectUser(null),this._updateCurrentUser(null,!0))}setPersistence(e){return _isFirebaseServerApp(this.app)?Promise.reject(_serverAppCurrentUserOperationNotSupportedError(this)):this.queue(async()=>{await this.assertedPersistence.setPersistence(_getInstance(e))})}_getRecaptchaConfig(){return null==this.tenantId?this._agentRecaptchaConfig:this._tenantRecaptchaConfigs[this.tenantId]}async validatePassword(e){this._getPasswordPolicyInternal()||await this._updatePasswordPolicy();const i=this._getPasswordPolicyInternal();return i.schemaVersion!==this.EXPECTED_PASSWORD_POLICY_SCHEMA_VERSION?Promise.reject(this._errorFactory.create("unsupported-password-policy-schema-version",{})):i.validatePassword(e)}_getPasswordPolicyInternal(){return null===this.tenantId?this._projectPasswordPolicy:this._tenantPasswordPolicies[this.tenantId]}async _updatePasswordPolicy(){const e=await async function(e,i={}){return _performApiRequest(e,"GET","/v2/passwordPolicy",_addTidIfNecessary(e,i))}
/**
 * @license
 * Copyright 2023 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */(this),i=new PasswordPolicyImpl(e);null===this.tenantId?this._projectPasswordPolicy=i:this._tenantPasswordPolicies[this.tenantId]=i}_getPersistence(){return this.assertedPersistence.persistence.type}_updateErrorMap(e){this._errorFactory=new ErrorFactory("auth","Firebase",e())}onAuthStateChanged(e,i,s){return this.registerStateListener(this.authStateSubscription,e,i,s)}beforeAuthStateChanged(e,i){return this.beforeStateQueue.pushCallback(e,i)}onIdTokenChanged(e,i,s){return this.registerStateListener(this.idTokenSubscription,e,i,s)}authStateReady(){return new Promise((e,i)=>{if(this.currentUser)e();else{const s=this.onAuthStateChanged(()=>{s(),e()},i)}})}async revokeAccessToken(e){if(this.currentUser){const i={providerId:"apple.com",tokenType:"ACCESS_TOKEN",token:e,idToken:await this.currentUser.getIdToken()};null!=this.tenantId&&(i.tenantId=this.tenantId),await async function(e,i){return _performApiRequest(e,"POST","/v2/accounts:revokeToken",_addTidIfNecessary(e,i))}(this,i)}}toJSON(){var e;return{apiKey:this.config.apiKey,authDomain:this.config.authDomain,appName:this.name,currentUser:null===(e=this._currentUser)||void 0===e?void 0:e.toJSON()}}async _setRedirectUser(e,i){const s=await this.getOrInitRedirectPersistenceManager(i);return null===e?s.removeCurrentUser():s.setCurrentUser(e)}async getOrInitRedirectPersistenceManager(e){if(!this.redirectPersistenceManager){const i=e&&_getInstance(e)||this._popupRedirectResolver;_assert(i,this,"argument-error"),this.redirectPersistenceManager=await PersistenceUserManager.create(this,[_getInstance(i._redirectPersistence)],"redirectUser"),this.redirectUser=await this.redirectPersistenceManager.getCurrentUser()}return this.redirectPersistenceManager}async _redirectUserForId(e){var i,s;return this._isInitialized&&await this.queue(async()=>{}),(null===(i=this._currentUser)||void 0===i?void 0:i._redirectEventId)===e?this._currentUser:(null===(s=this.redirectUser)||void 0===s?void 0:s._redirectEventId)===e?this.redirectUser:null}async _persistUserIfCurrent(e){if(e===this.currentUser)return this.queue(async()=>this.directlySetCurrentUser(e))}_notifyListenersIfCurrent(e){e===this.currentUser&&this.notifyAuthListeners()}_key(){return`${this.config.authDomain}:${this.config.apiKey}:${this.name}`}_startProactiveRefresh(){this.isProactiveRefreshEnabled=!0,this.currentUser&&this._currentUser._startProactiveRefresh()}_stopProactiveRefresh(){this.isProactiveRefreshEnabled=!1,this.currentUser&&this._currentUser._stopProactiveRefresh()}get _currentUser(){return this.currentUser}notifyAuthListeners(){var e,i;if(!this._isInitialized)return;this.idTokenSubscription.next(this.currentUser);const s=null!==(i=null===(e=this.currentUser)||void 0===e?void 0:e.uid)&&void 0!==i?i:null;this.lastNotifiedUid!==s&&(this.lastNotifiedUid=s,this.authStateSubscription.next(this.currentUser))}registerStateListener(e,i,s,o){if(this._deleted)return()=>{};const l="function"==typeof i?i:i.next.bind(i);let h=!1;const d=this._isInitialized?Promise.resolve():this._initializationPromise;if(_assert(d,this,"internal-error"),d.then(()=>{h||l(this.currentUser)}),"function"==typeof i){const l=e.addObserver(i,s,o);return()=>{h=!0,l()}}{const s=e.addObserver(i);return()=>{h=!0,s()}}}async directlySetCurrentUser(e){this.currentUser&&this.currentUser!==e&&this._currentUser._stopProactiveRefresh(),e&&this.isProactiveRefreshEnabled&&e._startProactiveRefresh(),this.currentUser=e,e?await this.assertedPersistence.setCurrentUser(e):await this.assertedPersistence.removeCurrentUser()}queue(e){return this.operations=this.operations.then(e,e),this.operations}get assertedPersistence(){return _assert(this.persistenceManager,this,"internal-error"),this.persistenceManager}_logFramework(e){e&&!this.frameworks.includes(e)&&(this.frameworks.push(e),this.frameworks.sort(),this.clientVersion=_getClientVersion(this.config.clientPlatform,this._getFrameworks()))}_getFrameworks(){return this.frameworks}async _getAdditionalHeaders(){var e;const i={"X-Client-Version":this.clientVersion};this.app.options.appId&&(i["X-Firebase-gmpid"]=this.app.options.appId);const s=await(null===(e=this.heartbeatServiceProvider.getImmediate({optional:!0}))||void 0===e?void 0:e.getHeartbeatsHeader());s&&(i["X-Firebase-Client"]=s);const o=await this._getAppCheckToken();return o&&(i["X-Firebase-AppCheck"]=o),i}async _getAppCheckToken(){var e;const i=await(null===(e=this.appCheckServiceProvider.getImmediate({optional:!0}))||void 0===e?void 0:e.getToken());return(null==i?void 0:i.error)&&function(e,...i){xe.logLevel<=o.WARN&&xe.warn(`Auth (${Ne}): ${e}`,...i)}(`Error while retrieving App Check token: ${i.error}`),null==i?void 0:i.token}}function _castAuth(e){return getModularInstance(e)}class Subscription{constructor(e){this.auth=e,this.observer=null,this.addObserver=function(e,i){const s=new ObserverProxy(e,i);return s.subscribe.bind(s)}(e=>this.observer=e)}get next(){return _assert(this.observer,this.auth,"internal-error"),this.observer.next.bind(this.observer)}}
/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */let We={async loadJS(){throw new Error("Unable to load external scripts")},recaptchaV2Script:"",recaptchaEnterpriseScript:"",gapiScript:""};function _loadJS(e){return We.loadJS(e)}class RecaptchaEnterpriseVerifier{constructor(e){this.type="recaptcha-enterprise",this.auth=_castAuth(e)}async verify(e="verify",i=!1){async function retrieveSiteKey(e){if(!i){if(null==e.tenantId&&null!=e._agentRecaptchaConfig)return e._agentRecaptchaConfig.siteKey;if(null!=e.tenantId&&void 0!==e._tenantRecaptchaConfigs[e.tenantId])return e._tenantRecaptchaConfigs[e.tenantId].siteKey}return new Promise(async(i,s)=>{(async function(e,i){return _performApiRequest(e,"GET","/v2/recaptchaConfig",_addTidIfNecessary(e,i))})(e,{clientType:"CLIENT_TYPE_WEB",version:"RECAPTCHA_ENTERPRISE"}).then(o=>{if(void 0!==o.recaptchaKey){const s=new RecaptchaConfig(o);return null==e.tenantId?e._agentRecaptchaConfig=s:e._tenantRecaptchaConfigs[e.tenantId]=s,i(s.siteKey)}s(new Error("recaptcha Enterprise site key undefined"))}).catch(e=>{s(e)})})}function retrieveRecaptchaToken(i,s,o){const l=window.grecaptcha;isEnterprise(l)?l.enterprise.ready(()=>{l.enterprise.execute(i,{action:e}).then(e=>{s(e)}).catch(()=>{s("NO_RECAPTCHA")})}):o(Error("No reCAPTCHA enterprise script loaded."))}return new Promise((e,s)=>{retrieveSiteKey(this.auth).then(o=>{if(!i&&isEnterprise(window.grecaptcha))retrieveRecaptchaToken(o,e,s);else{if("undefined"==typeof window)return void s(new Error("RecaptchaVerifier is only supported in browser"));let i=We.recaptchaEnterpriseScript;0!==i.length&&(i+=o),_loadJS(i).then(()=>{retrieveRecaptchaToken(o,e,s)}).catch(e=>{s(e)})}}).catch(e=>{s(e)})})}}async function injectRecaptchaFields(e,i,s,o=!1){const l=new RecaptchaEnterpriseVerifier(e);let h;try{h=await l.verify(s)}catch(_){h=await l.verify(s,!0)}const d=Object.assign({},i);return o?Object.assign(d,{captchaResp:h}):Object.assign(d,{captchaResponse:h}),Object.assign(d,{clientType:"CLIENT_TYPE_WEB"}),Object.assign(d,{recaptchaVersion:"RECAPTCHA_ENTERPRISE"}),d}async function handleRecaptchaFlow(e,i,s,o){var l;if(null===(l=e._getRecaptchaConfig())||void 0===l?void 0:l.isProviderEnabled("EMAIL_PASSWORD_PROVIDER")){const l=await injectRecaptchaFields(e,i,s,"getOobCode"===s);return o(e,l)}return o(e,i).catch(async l=>{if("auth/missing-recaptcha-token"===l.code){const l=await injectRecaptchaFields(e,i,s,"getOobCode"===s);return o(e,l)}return Promise.reject(l)})}
/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function connectAuthEmulator(e,i,s){const o=_castAuth(e);_assert(o._canInitEmulator,o,"emulator-config-failed"),_assert(/^https?:\/\//.test(i),o,"invalid-emulator-scheme");const l=!!(null==s?void 0:s.disableWarnings),h=extractProtocol(i),{host:d,port:_}=function(e){const i=extractProtocol(e),s=/(\/\/)?([^?#/]+)/.exec(e.substr(i.length));if(!s)return{host:"",port:null};const o=s[2].split("@").pop()||"",l=/^(\[[^\]]+\])(:|$)/.exec(o);if(l){const e=l[1];return{host:e,port:parsePort(o.substr(e.length+1))}}{const[e,i]=o.split(":");return{host:e,port:parsePort(i)}}}(i),f=null===_?"":`:${_}`;o.config.emulator={url:`${h}//${d}${f}/`},o.settings.appVerificationDisabledForTesting=!0,o.emulatorConfig=Object.freeze({host:d,port:_,protocol:h.replace(":",""),options:Object.freeze({disableWarnings:l})}),l||function(){function attachBanner(){const e=document.createElement("p"),i=e.style;e.innerText="Running in emulator mode. Do not use with production credentials.",i.position="fixed",i.width="100%",i.backgroundColor="#ffffff",i.border=".1em solid #000000",i.color="#b50000",i.bottom="0px",i.left="0px",i.margin="0px",i.zIndex="10000",i.textAlign="center",e.classList.add("firebase-emulator-warning"),document.body.appendChild(e)}"undefined"!=typeof console&&console.info;"undefined"!=typeof window&&"undefined"!=typeof document&&("loading"===document.readyState?window.addEventListener("DOMContentLoaded",attachBanner):attachBanner())}
/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */()}function extractProtocol(e){const i=e.indexOf(":");return i<0?"":e.substr(0,i+1)}function parsePort(e){if(!e)return null;const i=Number(e);return isNaN(i)?null:i}class AuthCredential{constructor(e,i){this.providerId=e,this.signInMethod=i}toJSON(){return debugFail("not implemented")}_getIdTokenResponse(e){return debugFail("not implemented")}_linkToIdToken(e,i){return debugFail("not implemented")}_getReauthenticationResolver(e){return debugFail("not implemented")}}async function linkEmailPassword(e,i){return _performApiRequest(e,"POST","/v1/accounts:signUp",i)}
/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function signInWithPassword(e,i){return _performSignInRequest(e,"POST","/v1/accounts:signInWithPassword",_addTidIfNecessary(e,i))}
/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
class EmailAuthCredential extends AuthCredential{constructor(e,i,s,o=null){super("password",s),this._email=e,this._password=i,this._tenantId=o}static _fromEmailAndPassword(e,i){return new EmailAuthCredential(e,i,"password")}static _fromEmailAndCode(e,i,s=null){return new EmailAuthCredential(e,i,"emailLink",s)}toJSON(){return{email:this._email,password:this._password,signInMethod:this.signInMethod,tenantId:this._tenantId}}static fromJSON(e){const i="string"==typeof e?JSON.parse(e):e;if((null==i?void 0:i.email)&&(null==i?void 0:i.password)){if("password"===i.signInMethod)return this._fromEmailAndPassword(i.email,i.password);if("emailLink"===i.signInMethod)return this._fromEmailAndCode(i.email,i.password,i.tenantId)}return null}async _getIdTokenResponse(e){switch(this.signInMethod){case"password":return handleRecaptchaFlow(e,{returnSecureToken:!0,email:this._email,password:this._password,clientType:"CLIENT_TYPE_WEB"},"signInWithPassword",signInWithPassword);case"emailLink":return async function(e,i){return _performSignInRequest(e,"POST","/v1/accounts:signInWithEmailLink",_addTidIfNecessary(e,i))}(e,{email:this._email,oobCode:this._password});default:_fail(e,"internal-error")}}async _linkToIdToken(e,i){switch(this.signInMethod){case"password":return handleRecaptchaFlow(e,{idToken:i,returnSecureToken:!0,email:this._email,password:this._password,clientType:"CLIENT_TYPE_WEB"},"signUpPassword",linkEmailPassword);case"emailLink":return async function(e,i){return _performSignInRequest(e,"POST","/v1/accounts:signInWithEmailLink",_addTidIfNecessary(e,i))}(e,{idToken:i,email:this._email,oobCode:this._password});default:_fail(e,"internal-error")}}_getReauthenticationResolver(e){return this._getIdTokenResponse(e)}}
/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function signInWithIdp(e,i){return _performSignInRequest(e,"POST","/v1/accounts:signInWithIdp",_addTidIfNecessary(e,i))}
/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class OAuthCredential extends AuthCredential{constructor(){super(...arguments),this.pendingToken=null}static _fromParams(e){const i=new OAuthCredential(e.providerId,e.signInMethod);return e.idToken||e.accessToken?(e.idToken&&(i.idToken=e.idToken),e.accessToken&&(i.accessToken=e.accessToken),e.nonce&&!e.pendingToken&&(i.nonce=e.nonce),e.pendingToken&&(i.pendingToken=e.pendingToken)):e.oauthToken&&e.oauthTokenSecret?(i.accessToken=e.oauthToken,i.secret=e.oauthTokenSecret):_fail("argument-error"),i}toJSON(){return{idToken:this.idToken,accessToken:this.accessToken,secret:this.secret,nonce:this.nonce,pendingToken:this.pendingToken,providerId:this.providerId,signInMethod:this.signInMethod}}static fromJSON(e){const i="string"==typeof e?JSON.parse(e):e,{providerId:s,signInMethod:o}=i,l=__rest(i,["providerId","signInMethod"]);if(!s||!o)return null;const h=new OAuthCredential(s,o);return h.idToken=l.idToken||void 0,h.accessToken=l.accessToken||void 0,h.secret=l.secret,h.nonce=l.nonce,h.pendingToken=l.pendingToken||null,h}_getIdTokenResponse(e){return signInWithIdp(e,this.buildRequest())}_linkToIdToken(e,i){const s=this.buildRequest();return s.idToken=i,signInWithIdp(e,s)}_getReauthenticationResolver(e){const i=this.buildRequest();return i.autoCreate=!1,signInWithIdp(e,i)}buildRequest(){const e={requestUri:"http://localhost",returnSecureToken:!0};if(this.pendingToken)e.pendingToken=this.pendingToken;else{const i={};this.idToken&&(i.id_token=this.idToken),this.accessToken&&(i.access_token=this.accessToken),this.secret&&(i.oauth_token_secret=this.secret),i.providerId=this.providerId,this.nonce&&!this.pendingToken&&(i.nonce=this.nonce),e.postBody=querystring(i)}return e}}
/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class ActionCodeURL{constructor(e){var i,s,o,l,h,d;const _=querystringDecode(extractQuerystring(e)),f=null!==(i=_.apiKey)&&void 0!==i?i:null,g=null!==(s=_.oobCode)&&void 0!==s?s:null,v=function(e){switch(e){case"recoverEmail":return"RECOVER_EMAIL";case"resetPassword":return"PASSWORD_RESET";case"signIn":return"EMAIL_SIGNIN";case"verifyEmail":return"VERIFY_EMAIL";case"verifyAndChangeEmail":return"VERIFY_AND_CHANGE_EMAIL";case"revertSecondFactorAddition":return"REVERT_SECOND_FACTOR_ADDITION";default:return null}}(null!==(o=_.mode)&&void 0!==o?o:null);_assert(f&&g&&v,"argument-error"),this.apiKey=f,this.operation=v,this.code=g,this.continueUrl=null!==(l=_.continueUrl)&&void 0!==l?l:null,this.languageCode=null!==(h=_.languageCode)&&void 0!==h?h:null,this.tenantId=null!==(d=_.tenantId)&&void 0!==d?d:null}static parseLink(e){const i=function(e){const i=querystringDecode(extractQuerystring(e)).link,s=i?querystringDecode(extractQuerystring(i)).deep_link_id:null,o=querystringDecode(extractQuerystring(e)).deep_link_id;return(o?querystringDecode(extractQuerystring(o)).link:null)||o||s||i||e}(e);try{return new ActionCodeURL(i)}catch(s){return null}}}
/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class EmailAuthProvider{constructor(){this.providerId=EmailAuthProvider.PROVIDER_ID}static credential(e,i){return EmailAuthCredential._fromEmailAndPassword(e,i)}static credentialWithLink(e,i){const s=ActionCodeURL.parseLink(i);return _assert(s,"argument-error"),EmailAuthCredential._fromEmailAndCode(e,s.code,s.tenantId)}}EmailAuthProvider.PROVIDER_ID="password",EmailAuthProvider.EMAIL_PASSWORD_SIGN_IN_METHOD="password",EmailAuthProvider.EMAIL_LINK_SIGN_IN_METHOD="emailLink";
/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
class FederatedAuthProvider{constructor(e){this.providerId=e,this.defaultLanguageCode=null,this.customParameters={}}setDefaultLanguage(e){this.defaultLanguageCode=e}setCustomParameters(e){return this.customParameters=e,this}getCustomParameters(){return this.customParameters}}
/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class BaseOAuthProvider extends FederatedAuthProvider{constructor(){super(...arguments),this.scopes=[]}addScope(e){return this.scopes.includes(e)||this.scopes.push(e),this}getScopes(){return[...this.scopes]}}
/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class FacebookAuthProvider extends BaseOAuthProvider{constructor(){super("facebook.com")}static credential(e){return OAuthCredential._fromParams({providerId:FacebookAuthProvider.PROVIDER_ID,signInMethod:FacebookAuthProvider.FACEBOOK_SIGN_IN_METHOD,accessToken:e})}static credentialFromResult(e){return FacebookAuthProvider.credentialFromTaggedObject(e)}static credentialFromError(e){return FacebookAuthProvider.credentialFromTaggedObject(e.customData||{})}static credentialFromTaggedObject({_tokenResponse:e}){if(!e||!("oauthAccessToken"in e))return null;if(!e.oauthAccessToken)return null;try{return FacebookAuthProvider.credential(e.oauthAccessToken)}catch(i){return null}}}FacebookAuthProvider.FACEBOOK_SIGN_IN_METHOD="facebook.com",FacebookAuthProvider.PROVIDER_ID="facebook.com";
/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
class GoogleAuthProvider extends BaseOAuthProvider{constructor(){super("google.com"),this.addScope("profile")}static credential(e,i){return OAuthCredential._fromParams({providerId:GoogleAuthProvider.PROVIDER_ID,signInMethod:GoogleAuthProvider.GOOGLE_SIGN_IN_METHOD,idToken:e,accessToken:i})}static credentialFromResult(e){return GoogleAuthProvider.credentialFromTaggedObject(e)}static credentialFromError(e){return GoogleAuthProvider.credentialFromTaggedObject(e.customData||{})}static credentialFromTaggedObject({_tokenResponse:e}){if(!e)return null;const{oauthIdToken:i,oauthAccessToken:s}=e;if(!i&&!s)return null;try{return GoogleAuthProvider.credential(i,s)}catch(o){return null}}}GoogleAuthProvider.GOOGLE_SIGN_IN_METHOD="google.com",GoogleAuthProvider.PROVIDER_ID="google.com";
/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
class GithubAuthProvider extends BaseOAuthProvider{constructor(){super("github.com")}static credential(e){return OAuthCredential._fromParams({providerId:GithubAuthProvider.PROVIDER_ID,signInMethod:GithubAuthProvider.GITHUB_SIGN_IN_METHOD,accessToken:e})}static credentialFromResult(e){return GithubAuthProvider.credentialFromTaggedObject(e)}static credentialFromError(e){return GithubAuthProvider.credentialFromTaggedObject(e.customData||{})}static credentialFromTaggedObject({_tokenResponse:e}){if(!e||!("oauthAccessToken"in e))return null;if(!e.oauthAccessToken)return null;try{return GithubAuthProvider.credential(e.oauthAccessToken)}catch(i){return null}}}GithubAuthProvider.GITHUB_SIGN_IN_METHOD="github.com",GithubAuthProvider.PROVIDER_ID="github.com";
/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
class TwitterAuthProvider extends BaseOAuthProvider{constructor(){super("twitter.com")}static credential(e,i){return OAuthCredential._fromParams({providerId:TwitterAuthProvider.PROVIDER_ID,signInMethod:TwitterAuthProvider.TWITTER_SIGN_IN_METHOD,oauthToken:e,oauthTokenSecret:i})}static credentialFromResult(e){return TwitterAuthProvider.credentialFromTaggedObject(e)}static credentialFromError(e){return TwitterAuthProvider.credentialFromTaggedObject(e.customData||{})}static credentialFromTaggedObject({_tokenResponse:e}){if(!e)return null;const{oauthAccessToken:i,oauthTokenSecret:s}=e;if(!i||!s)return null;try{return TwitterAuthProvider.credential(i,s)}catch(o){return null}}}
/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
async function signUp(e,i){return _performSignInRequest(e,"POST","/v1/accounts:signUp",_addTidIfNecessary(e,i))}
/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */TwitterAuthProvider.TWITTER_SIGN_IN_METHOD="twitter.com",TwitterAuthProvider.PROVIDER_ID="twitter.com";class UserCredentialImpl{constructor(e){this.user=e.user,this.providerId=e.providerId,this._tokenResponse=e._tokenResponse,this.operationType=e.operationType}static async _fromIdTokenResponse(e,i,s,o=!1){const l=await UserImpl._fromIdTokenResponse(e,s,o),h=providerIdForResponse(s);return new UserCredentialImpl({user:l,providerId:h,_tokenResponse:s,operationType:i})}static async _forOperation(e,i,s){await e._updateTokensIfNecessary(s,!0);const o=providerIdForResponse(s);return new UserCredentialImpl({user:e,providerId:o,_tokenResponse:s,operationType:i})}}function providerIdForResponse(e){return e.providerId?e.providerId:"phoneNumber"in e?"phone":null}
/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class MultiFactorError extends FirebaseError{constructor(e,i,s,o){var l;super(i.code,i.message),this.operationType=s,this.user=o,Object.setPrototypeOf(this,MultiFactorError.prototype),this.customData={appName:e.name,tenantId:null!==(l=e.tenantId)&&void 0!==l?l:void 0,_serverResponse:i.customData._serverResponse,operationType:s}}static _fromErrorAndOperation(e,i,s,o){return new MultiFactorError(e,i,s,o)}}function _processCredentialSavingMfaContextIfNecessary(e,i,s,o){return("reauthenticate"===i?s._getReauthenticationResolver(e):s._getIdTokenResponse(e)).catch(s=>{if("auth/multi-factor-auth-required"===s.code)throw MultiFactorError._fromErrorAndOperation(e,s,i,o);throw s})}
/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
async function _signInWithCredential(e,i,s=!1){if(_isFirebaseServerApp(e.app))return Promise.reject(_serverAppCurrentUserOperationNotSupportedError(e));const o="signIn",l=await _processCredentialSavingMfaContextIfNecessary(e,o,i),h=await UserCredentialImpl._fromIdTokenResponse(e,o,l);return s||await e._updateCurrentUser(h.user),h}
/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
async function recachePasswordPolicy(e){const i=_castAuth(e);i._getPasswordPolicyInternal()&&await i._updatePasswordPolicy()}async function createUserWithEmailAndPassword(e,i,s){if(_isFirebaseServerApp(e.app))return Promise.reject(_serverAppCurrentUserOperationNotSupportedError(e));const o=_castAuth(e),l=handleRecaptchaFlow(o,{returnSecureToken:!0,email:i,password:s,clientType:"CLIENT_TYPE_WEB"},"signUpPassword",signUp),h=await l.catch(i=>{throw"auth/password-does-not-meet-requirements"===i.code&&recachePasswordPolicy(e),i}),d=await UserCredentialImpl._fromIdTokenResponse(o,"signIn",h);return await o._updateCurrentUser(d.user),d}function signInWithEmailAndPassword(e,i,s){return _isFirebaseServerApp(e.app)?Promise.reject(_serverAppCurrentUserOperationNotSupportedError(e)):async function(e,i){return _signInWithCredential(_castAuth(e),i)}(getModularInstance(e),EmailAuthProvider.credential(i,s)).catch(async i=>{throw"auth/password-does-not-meet-requirements"===i.code&&recachePasswordPolicy(e),i})}function onAuthStateChanged(e,i,s,o){return getModularInstance(e).onAuthStateChanged(i,s,o)}function signOut(e){return getModularInstance(e).signOut()}const ze="__sak";
/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class BrowserPersistenceClass{constructor(e,i){this.storageRetriever=e,this.type=i}_isAvailable(){try{return this.storage?(this.storage.setItem(ze,"1"),this.storage.removeItem(ze),Promise.resolve(!0)):Promise.resolve(!1)}catch(e){return Promise.resolve(!1)}}_set(e,i){return this.storage.setItem(e,JSON.stringify(i)),Promise.resolve()}_get(e){const i=this.storage.getItem(e);return Promise.resolve(i?JSON.parse(i):null)}_remove(e){return this.storage.removeItem(e),Promise.resolve()}get storage(){return this.storageRetriever()}}
/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class BrowserLocalPersistence extends BrowserPersistenceClass{constructor(){super(()=>window.localStorage,"LOCAL"),this.boundEventHandler=(e,i)=>this.onStorageEvent(e,i),this.listeners={},this.localCache={},this.pollTimer=null,this.fallbackToPolling=_isMobileBrowser(),this._shouldAllowMigration=!0}forAllChangedKeys(e){for(const i of Object.keys(this.listeners)){const s=this.storage.getItem(i),o=this.localCache[i];s!==o&&e(i,o,s)}}onStorageEvent(e,i=!1){if(!e.key)return void this.forAllChangedKeys((e,i,s)=>{this.notifyListeners(e,s)});const s=e.key;i?this.detachListener():this.stopPolling();const triggerListeners=()=>{const e=this.storage.getItem(s);(i||this.localCache[s]!==e)&&this.notifyListeners(s,e)},o=this.storage.getItem(s);_isIE10()&&o!==e.newValue&&e.newValue!==e.oldValue?setTimeout(triggerListeners,10):triggerListeners()}notifyListeners(e,i){this.localCache[e]=i;const s=this.listeners[e];if(s)for(const o of Array.from(s))o(i?JSON.parse(i):i)}startPolling(){this.stopPolling(),this.pollTimer=setInterval(()=>{this.forAllChangedKeys((e,i,s)=>{this.onStorageEvent(new StorageEvent("storage",{key:e,oldValue:i,newValue:s}),!0)})},1e3)}stopPolling(){this.pollTimer&&(clearInterval(this.pollTimer),this.pollTimer=null)}attachListener(){window.addEventListener("storage",this.boundEventHandler)}detachListener(){window.removeEventListener("storage",this.boundEventHandler)}_addListener(e,i){0===Object.keys(this.listeners).length&&(this.fallbackToPolling?this.startPolling():this.attachListener()),this.listeners[e]||(this.listeners[e]=new Set,this.localCache[e]=this.storage.getItem(e)),this.listeners[e].add(i)}_removeListener(e,i){this.listeners[e]&&(this.listeners[e].delete(i),0===this.listeners[e].size&&delete this.listeners[e]),0===Object.keys(this.listeners).length&&(this.detachListener(),this.stopPolling())}async _set(e,i){await super._set(e,i),this.localCache[e]=JSON.stringify(i)}async _get(e){const i=await super._get(e);return this.localCache[e]=JSON.stringify(i),i}async _remove(e){await super._remove(e),delete this.localCache[e]}}BrowserLocalPersistence.type="LOCAL";const $e=BrowserLocalPersistence;
/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class BrowserSessionPersistence extends BrowserPersistenceClass{constructor(){super(()=>window.sessionStorage,"SESSION")}_addListener(e,i){}_removeListener(e,i){}}BrowserSessionPersistence.type="SESSION";const Ge=BrowserSessionPersistence;
/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
class Receiver{constructor(e){this.eventTarget=e,this.handlersMap={},this.boundEventHandler=this.handleEvent.bind(this)}static _getInstance(e){const i=this.receivers.find(i=>i.isListeningto(e));if(i)return i;const s=new Receiver(e);return this.receivers.push(s),s}isListeningto(e){return this.eventTarget===e}async handleEvent(e){const i=e,{eventId:s,eventType:o,data:l}=i.data,h=this.handlersMap[o];if(!(null==h?void 0:h.size))return;i.ports[0].postMessage({status:"ack",eventId:s,eventType:o});const d=Array.from(h).map(async e=>e(i.origin,l)),_=await function(e){return Promise.all(e.map(async e=>{try{return{fulfilled:!0,value:await e}}catch(i){return{fulfilled:!1,reason:i}}}))}(d);i.ports[0].postMessage({status:"done",eventId:s,eventType:o,response:_})}_subscribe(e,i){0===Object.keys(this.handlersMap).length&&this.eventTarget.addEventListener("message",this.boundEventHandler),this.handlersMap[e]||(this.handlersMap[e]=new Set),this.handlersMap[e].add(i)}_unsubscribe(e,i){this.handlersMap[e]&&i&&this.handlersMap[e].delete(i),i&&0!==this.handlersMap[e].size||delete this.handlersMap[e],0===Object.keys(this.handlersMap).length&&this.eventTarget.removeEventListener("message",this.boundEventHandler)}}
/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
function _generateEventId(e="",i=10){let s="";for(let o=0;o<i;o++)s+=Math.floor(10*Math.random());return e+s}
/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */Receiver.receivers=[];class Sender{constructor(e){this.target=e,this.handlers=new Set}removeMessageHandler(e){e.messageChannel&&(e.messageChannel.port1.removeEventListener("message",e.onMessage),e.messageChannel.port1.close()),this.handlers.delete(e)}async _send(e,i,s=50){const o="undefined"!=typeof MessageChannel?new MessageChannel:null;if(!o)throw new Error("connection_unavailable");let l,h;return new Promise((d,_)=>{const f=_generateEventId("",20);o.port1.start();const g=setTimeout(()=>{_(new Error("unsupported_event"))},s);h={messageChannel:o,onMessage(e){const i=e;if(i.data.eventId===f)switch(i.data.status){case"ack":clearTimeout(g),l=setTimeout(()=>{_(new Error("timeout"))},3e3);break;case"done":clearTimeout(l),d(i.data.response);break;default:clearTimeout(g),clearTimeout(l),_(new Error("invalid_response"))}}},this.handlers.add(h),o.port1.addEventListener("message",h.onMessage),this.target.postMessage({eventType:e,eventId:f,data:i},[o.port2])}).finally(()=>{h&&this.removeMessageHandler(h)})}}
/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function _window(){return window}
/**
 * @license
 * Copyright 2020 Google LLC.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
function _isWorker(){return void 0!==_window().WorkerGlobalScope&&"function"==typeof _window().importScripts}
/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
const Qe="firebaseLocalStorageDb",He="firebaseLocalStorage",Je="fbase_key";class DBPromise{constructor(e){this.request=e}toPromise(){return new Promise((e,i)=>{this.request.addEventListener("success",()=>{e(this.request.result)}),this.request.addEventListener("error",()=>{i(this.request.error)})})}}function getObjectStore(e,i){return e.transaction([He],i?"readwrite":"readonly").objectStore(He)}function _openDatabase(){const e=indexedDB.open(Qe,1);return new Promise((i,s)=>{e.addEventListener("error",()=>{s(e.error)}),e.addEventListener("upgradeneeded",()=>{const i=e.result;try{i.createObjectStore(He,{keyPath:Je})}catch(o){s(o)}}),e.addEventListener("success",async()=>{const s=e.result;s.objectStoreNames.contains(He)?i(s):(s.close(),await function(){const e=indexedDB.deleteDatabase(Qe);return new DBPromise(e).toPromise()}(),i(await _openDatabase()))})})}async function _putObject(e,i,s){const o=getObjectStore(e,!0).put({[Je]:i,value:s});return new DBPromise(o).toPromise()}function _deleteObject(e,i){const s=getObjectStore(e,!0).delete(i);return new DBPromise(s).toPromise()}class IndexedDBLocalPersistence{constructor(){this.type="LOCAL",this._shouldAllowMigration=!0,this.listeners={},this.localCache={},this.pollTimer=null,this.pendingWrites=0,this.receiver=null,this.sender=null,this.serviceWorkerReceiverAvailable=!1,this.activeServiceWorker=null,this._workerInitializationPromise=this.initializeServiceWorkerMessaging().then(()=>{},()=>{})}async _openDb(){return this.db||(this.db=await _openDatabase()),this.db}async _withRetries(e){let i=0;for(;;)try{const i=await this._openDb();return await e(i)}catch(s){if(i++>3)throw s;this.db&&(this.db.close(),this.db=void 0)}}async initializeServiceWorkerMessaging(){return _isWorker()?this.initializeReceiver():this.initializeSender()}async initializeReceiver(){this.receiver=Receiver._getInstance(_isWorker()?self:null),this.receiver._subscribe("keyChanged",async(e,i)=>({keyProcessed:(await this._poll()).includes(i.key)})),this.receiver._subscribe("ping",async(e,i)=>["keyChanged"])}async initializeSender(){var e,i;if(this.activeServiceWorker=await async function(){if(!(null===navigator||void 0===navigator?void 0:navigator.serviceWorker))return null;try{return(await navigator.serviceWorker.ready).active}catch(e){return null}}(),!this.activeServiceWorker)return;this.sender=new Sender(this.activeServiceWorker);const s=await this.sender._send("ping",{},800);s&&(null===(e=s[0])||void 0===e?void 0:e.fulfilled)&&(null===(i=s[0])||void 0===i?void 0:i.value.includes("keyChanged"))&&(this.serviceWorkerReceiverAvailable=!0)}async notifyServiceWorker(e){var i;if(this.sender&&this.activeServiceWorker&&((null===(i=null===navigator||void 0===navigator?void 0:navigator.serviceWorker)||void 0===i?void 0:i.controller)||null)===this.activeServiceWorker)try{await this.sender._send("keyChanged",{key:e},this.serviceWorkerReceiverAvailable?800:50)}catch(i){}}async _isAvailable(){try{if(!indexedDB)return!1;const e=await _openDatabase();return await _putObject(e,ze,"1"),await _deleteObject(e,ze),!0}catch(e){}return!1}async _withPendingWrite(e){this.pendingWrites++;try{await e()}finally{this.pendingWrites--}}async _set(e,i){return this._withPendingWrite(async()=>(await this._withRetries(s=>_putObject(s,e,i)),this.localCache[e]=i,this.notifyServiceWorker(e)))}async _get(e){const i=await this._withRetries(i=>async function(e,i){const s=getObjectStore(e,!1).get(i),o=await new DBPromise(s).toPromise();return void 0===o?null:o.value}(i,e));return this.localCache[e]=i,i}async _remove(e){return this._withPendingWrite(async()=>(await this._withRetries(i=>_deleteObject(i,e)),delete this.localCache[e],this.notifyServiceWorker(e)))}async _poll(){const e=await this._withRetries(e=>{const i=getObjectStore(e,!1).getAll();return new DBPromise(i).toPromise()});if(!e)return[];if(0!==this.pendingWrites)return[];const i=[],s=new Set;if(0!==e.length)for(const{fbase_key:o,value:l}of e)s.add(o),JSON.stringify(this.localCache[o])!==JSON.stringify(l)&&(this.notifyListeners(o,l),i.push(o));for(const o of Object.keys(this.localCache))this.localCache[o]&&!s.has(o)&&(this.notifyListeners(o,null),i.push(o));return i}notifyListeners(e,i){this.localCache[e]=i;const s=this.listeners[e];if(s)for(const o of Array.from(s))o(i)}startPolling(){this.stopPolling(),this.pollTimer=setInterval(async()=>this._poll(),800)}stopPolling(){this.pollTimer&&(clearInterval(this.pollTimer),this.pollTimer=null)}_addListener(e,i){0===Object.keys(this.listeners).length&&this.startPolling(),this.listeners[e]||(this.listeners[e]=new Set,this._get(e)),this.listeners[e].add(i)}_removeListener(e,i){this.listeners[e]&&(this.listeners[e].delete(i),0===this.listeners[e].size&&delete this.listeners[e]),0===Object.keys(this.listeners).length&&this.stopPolling()}}IndexedDBLocalPersistence.type="LOCAL";const Xe=IndexedDBLocalPersistence;
/**
 * @license
 * Copyright 2021 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
function _withDefaultResolver(e,i){return i?_getInstance(i):(_assert(e._popupRedirectResolver,e,"argument-error"),e._popupRedirectResolver)}
/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */new Delay(3e4,6e4);class IdpCredential extends AuthCredential{constructor(e){super("custom","custom"),this.params=e}_getIdTokenResponse(e){return signInWithIdp(e,this._buildIdpRequest())}_linkToIdToken(e,i){return signInWithIdp(e,this._buildIdpRequest(i))}_getReauthenticationResolver(e){return signInWithIdp(e,this._buildIdpRequest())}_buildIdpRequest(e){const i={requestUri:this.params.requestUri,sessionId:this.params.sessionId,postBody:this.params.postBody,tenantId:this.params.tenantId,pendingToken:this.params.pendingToken,returnSecureToken:!0,returnIdpCredential:!0};return e&&(i.idToken=e),i}}function _signIn(e){return _signInWithCredential(e.auth,new IdpCredential(e),e.bypassAuthState)}function _reauth(e){const{auth:i,user:s}=e;return _assert(s,i,"internal-error"),
/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
async function(e,i,s=!1){const{auth:o}=e;if(_isFirebaseServerApp(o.app))return Promise.reject(_serverAppCurrentUserOperationNotSupportedError(o));const l="reauthenticate";try{const h=await _logoutIfInvalidated(e,_processCredentialSavingMfaContextIfNecessary(o,l,i,e),s);_assert(h.idToken,o,"internal-error");const d=_parseToken(h.idToken);_assert(d,o,"internal-error");const{sub:_}=d;return _assert(e.uid===_,o,"user-mismatch"),UserCredentialImpl._forOperation(e,l,h)}catch(h){throw"auth/user-not-found"===(null==h?void 0:h.code)&&_fail(o,"user-mismatch"),h}}(s,new IdpCredential(e),e.bypassAuthState)}async function _link(e){const{auth:i,user:s}=e;return _assert(s,i,"internal-error"),async function(e,i,s=!1){const o=await _logoutIfInvalidated(e,i._linkToIdToken(e.auth,await e.getIdToken()),s);return UserCredentialImpl._forOperation(e,"link",o)}(s,new IdpCredential(e),e.bypassAuthState)}
/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class AbstractPopupRedirectOperation{constructor(e,i,s,o,l=!1){this.auth=e,this.resolver=s,this.user=o,this.bypassAuthState=l,this.pendingPromise=null,this.eventManager=null,this.filter=Array.isArray(i)?i:[i]}execute(){return new Promise(async(e,i)=>{this.pendingPromise={resolve:e,reject:i};try{this.eventManager=await this.resolver._initialize(this.auth),await this.onExecution(),this.eventManager.registerConsumer(this)}catch(s){this.reject(s)}})}async onAuthEvent(e){const{urlResponse:i,sessionId:s,postBody:o,tenantId:l,error:h,type:d}=e;if(h)return void this.reject(h);const _={auth:this.auth,requestUri:i,sessionId:s,tenantId:l||void 0,postBody:o||void 0,user:this.user,bypassAuthState:this.bypassAuthState};try{this.resolve(await this.getIdpTask(d)(_))}catch(f){this.reject(f)}}onError(e){this.reject(e)}getIdpTask(e){switch(e){case"signInViaPopup":case"signInViaRedirect":return _signIn;case"linkViaPopup":case"linkViaRedirect":return _link;case"reauthViaPopup":case"reauthViaRedirect":return _reauth;default:_fail(this.auth,"internal-error")}}resolve(e){debugAssert(this.pendingPromise,"Pending promise was never set"),this.pendingPromise.resolve(e),this.unregisterAndCleanUp()}reject(e){debugAssert(this.pendingPromise,"Pending promise was never set"),this.pendingPromise.reject(e),this.unregisterAndCleanUp()}unregisterAndCleanUp(){this.eventManager&&this.eventManager.unregisterConsumer(this),this.pendingPromise=null,this.cleanUp()}}
/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Ye=new Delay(2e3,1e4);async function signInWithPopup(e,i,s){if(_isFirebaseServerApp(e.app))return Promise.reject(_createError(e,"operation-not-supported-in-this-environment"));const o=_castAuth(e);_assertInstanceOf(e,i,FederatedAuthProvider);const l=_withDefaultResolver(o,s);return new PopupOperation(o,"signInViaPopup",i,l).executeNotNull()}class PopupOperation extends AbstractPopupRedirectOperation{constructor(e,i,s,o,l){super(e,i,o,l),this.provider=s,this.authWindow=null,this.pollId=null,PopupOperation.currentPopupAction&&PopupOperation.currentPopupAction.cancel(),PopupOperation.currentPopupAction=this}async executeNotNull(){const e=await this.execute();return _assert(e,this.auth,"internal-error"),e}async onExecution(){debugAssert(1===this.filter.length,"Popup operations only handle one event");const e=_generateEventId();this.authWindow=await this.resolver._openPopup(this.auth,this.provider,this.filter[0],e),this.authWindow.associatedEvent=e,this.resolver._originValidation(this.auth).catch(e=>{this.reject(e)}),this.resolver._isIframeWebStorageSupported(this.auth,e=>{e||this.reject(_createError(this.auth,"web-storage-unsupported"))}),this.pollUserCancellation()}get eventId(){var e;return(null===(e=this.authWindow)||void 0===e?void 0:e.associatedEvent)||null}cancel(){this.reject(_createError(this.auth,"cancelled-popup-request"))}cleanUp(){this.authWindow&&this.authWindow.close(),this.pollId&&window.clearTimeout(this.pollId),this.authWindow=null,this.pollId=null,PopupOperation.currentPopupAction=null}pollUserCancellation(){const poll=()=>{var e,i;(null===(i=null===(e=this.authWindow)||void 0===e?void 0:e.window)||void 0===i?void 0:i.closed)?this.pollId=window.setTimeout(()=>{this.pollId=null,this.reject(_createError(this.auth,"popup-closed-by-user"))},8e3):this.pollId=window.setTimeout(poll,Ye.get())};poll()}}PopupOperation.currentPopupAction=null;
/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
const Ze=new Map;class RedirectAction extends AbstractPopupRedirectOperation{constructor(e,i,s=!1){super(e,["signInViaRedirect","linkViaRedirect","reauthViaRedirect","unknown"],i,void 0,s),this.eventId=null}async execute(){let e=Ze.get(this.auth._key());if(!e){try{const i=await async function(e,i){const s=pendingRedirectKey(i),o=resolverPersistence(e);if(!(await o._isAvailable()))return!1;const l="true"===await o._get(s);return await o._remove(s),l}(this.resolver,this.auth)?await super.execute():null;e=()=>Promise.resolve(i)}catch(i){e=()=>Promise.reject(i)}Ze.set(this.auth._key(),e)}return this.bypassAuthState||Ze.set(this.auth._key(),()=>Promise.resolve(null)),e()}async onAuthEvent(e){if("signInViaRedirect"===e.type)return super.onAuthEvent(e);if("unknown"!==e.type){if(e.eventId){const i=await this.auth._redirectUserForId(e.eventId);if(i)return this.user=i,super.onAuthEvent(e);this.resolve(null)}}else this.resolve(null)}async onExecution(){}cleanUp(){}}function _overrideRedirectResult(e,i){Ze.set(e._key(),i)}function resolverPersistence(e){return _getInstance(e._redirectPersistence)}function pendingRedirectKey(e){return _persistenceKeyName("pendingRedirect",e.config.apiKey,e.name)}
/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function signInWithRedirect(e,i,s){return async function(e,i,s){if(_isFirebaseServerApp(e.app))return Promise.reject(_serverAppCurrentUserOperationNotSupportedError(e));const o=_castAuth(e);_assertInstanceOf(e,i,FederatedAuthProvider),await o._initializationPromise;const l=_withDefaultResolver(o,s);return await async function(e,i){return resolverPersistence(e)._set(pendingRedirectKey(i),"true")}(l,o),l._openRedirect(o,i,"signInViaRedirect")}(e,i,s)}async function getRedirectResult(e,i){return await _castAuth(e)._initializationPromise,_getRedirectResult(e,i,!1)}async function _getRedirectResult(e,i,s=!1){if(_isFirebaseServerApp(e.app))return Promise.reject(_serverAppCurrentUserOperationNotSupportedError(e));const o=_castAuth(e),l=_withDefaultResolver(o,i),h=new RedirectAction(o,l,s),d=await h.execute();return d&&!s&&(delete d.user._redirectEventId,await o._persistUserIfCurrent(d.user),await o._setRedirectUser(null,i)),d}
/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class AuthEventManager{constructor(e){this.auth=e,this.cachedEventUids=new Set,this.consumers=new Set,this.queuedRedirectEvent=null,this.hasHandledPotentialRedirect=!1,this.lastProcessedEventTime=Date.now()}registerConsumer(e){this.consumers.add(e),this.queuedRedirectEvent&&this.isEventForConsumer(this.queuedRedirectEvent,e)&&(this.sendToConsumer(this.queuedRedirectEvent,e),this.saveEventToCache(this.queuedRedirectEvent),this.queuedRedirectEvent=null)}unregisterConsumer(e){this.consumers.delete(e)}onEvent(e){if(this.hasEventBeenHandled(e))return!1;let i=!1;return this.consumers.forEach(s=>{this.isEventForConsumer(e,s)&&(i=!0,this.sendToConsumer(e,s),this.saveEventToCache(e))}),this.hasHandledPotentialRedirect||!function(e){switch(e.type){case"signInViaRedirect":case"linkViaRedirect":case"reauthViaRedirect":return!0;case"unknown":return isNullRedirectEvent(e);default:return!1}}
/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */(e)||(this.hasHandledPotentialRedirect=!0,i||(this.queuedRedirectEvent=e,i=!0)),i}sendToConsumer(e,i){var s;if(e.error&&!isNullRedirectEvent(e)){const o=(null===(s=e.error.code)||void 0===s?void 0:s.split("auth/")[1])||"internal-error";i.onError(_createError(this.auth,o))}else i.onAuthEvent(e)}isEventForConsumer(e,i){const s=null===i.eventId||!!e.eventId&&e.eventId===i.eventId;return i.filter.includes(e.type)&&s}hasEventBeenHandled(e){return Date.now()-this.lastProcessedEventTime>=6e5&&this.cachedEventUids.clear(),this.cachedEventUids.has(eventUid(e))}saveEventToCache(e){this.cachedEventUids.add(eventUid(e)),this.lastProcessedEventTime=Date.now()}}function eventUid(e){return[e.type,e.eventId,e.sessionId,e.tenantId].filter(e=>e).join("-")}function isNullRedirectEvent({type:e,error:i}){return"unknown"===e&&"auth/no-auth-event"===(null==i?void 0:i.code)}
/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
const et=/^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/,tt=/^https?/;async function _validateOrigin(e){if(e.config.emulator)return;const{authorizedDomains:i}=await async function(e,i={}){return _performApiRequest(e,"GET","/v1/projects",i)}(e);for(const o of i)try{if(matchDomain(o))return}catch(s){}_fail(e,"unauthorized-domain")}function matchDomain(e){const i=_getCurrentUrl(),{protocol:s,hostname:o}=new URL(i);if(e.startsWith("chrome-extension://")){const l=new URL(e);return""===l.hostname&&""===o?"chrome-extension:"===s&&e.replace("chrome-extension://","")===i.replace("chrome-extension://",""):"chrome-extension:"===s&&l.hostname===o}if(!tt.test(s))return!1;if(et.test(e))return o===e;const l=e.replace(/\./g,"\\.");return new RegExp("^(.+\\."+l+"|"+l+")$","i").test(o)}
/**
 * @license
 * Copyright 2020 Google LLC.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const rt=new Delay(3e4,6e4);function resetUnloadedGapiModules(){const e=_window().___jsl;if(null==e?void 0:e.H)for(const i of Object.keys(e.H))if(e.H[i].r=e.H[i].r||[],e.H[i].L=e.H[i].L||[],e.H[i].r=[...e.H[i].L],e.CP)for(let s=0;s<e.CP.length;s++)e.CP[s]=null}function loadGapi(e){return new Promise((i,s)=>{var o,l,h;function loadGapiIframe(){resetUnloadedGapiModules(),gapi.load("gapi.iframes",{callback:()=>{i(gapi.iframes.getContext())},ontimeout:()=>{resetUnloadedGapiModules(),s(_createError(e,"network-request-failed"))},timeout:rt.get()})}if(null===(l=null===(o=_window().gapi)||void 0===o?void 0:o.iframes)||void 0===l?void 0:l.Iframe)i(gapi.iframes.getContext());else{if(!(null===(h=_window().gapi)||void 0===h?void 0:h.load)){const i=`__${"iframefcb"}${Math.floor(1e6*Math.random())}`;return _window()[i]=()=>{gapi.load?loadGapiIframe():s(_createError(e,"network-request-failed"))},_loadJS(`${We.gapiScript}?onload=${i}`).catch(e=>s(e))}loadGapiIframe()}}).catch(e=>{throw nt=null,e})}let nt=null;
/**
 * @license
 * Copyright 2020 Google LLC.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
const it=new Delay(5e3,15e3),st={style:{position:"absolute",top:"-100px",width:"1px",height:"1px"},"aria-hidden":"true",tabindex:"-1"},ot=new Map([["identitytoolkit.googleapis.com","p"],["staging-identitytoolkit.sandbox.googleapis.com","s"],["test-identitytoolkit.sandbox.googleapis.com","t"]]);function getIframeUrl(e){const i=e.config;_assert(i.authDomain,e,"auth-domain-config-required");const s=i.emulator?_emulatorUrl(i,"emulator/auth/iframe"):`https://${e.config.authDomain}/__/auth/iframe`,o={apiKey:i.apiKey,appName:e.name,v:Ne},l=ot.get(e.config.apiHost);l&&(o.eid=l);const h=e._getFrameworks();return h.length&&(o.fw=h.join(",")),`${s}?${querystring(o).slice(1)}`}async function _openIframe(e){const i=await function(e){return nt=nt||loadGapi(e),nt}(e),s=_window().gapi;return _assert(s,e,"internal-error"),i.open({where:document.body,url:getIframeUrl(e),messageHandlersFilter:s.iframes.CROSS_ORIGIN_IFRAMES_FILTER,attributes:st,dontclear:!0},i=>new Promise(async(s,o)=>{await i.restyle({setHideOnLeave:!1});const l=_createError(e,"network-request-failed"),h=_window().setTimeout(()=>{o(l)},it.get());function clearTimerAndResolve(){_window().clearTimeout(h),s(i)}i.ping(clearTimerAndResolve).then(clearTimerAndResolve,()=>{o(l)})}))}
/**
 * @license
 * Copyright 2020 Google LLC.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const at={location:"yes",resizable:"yes",statusbar:"yes",toolbar:"no"};class AuthPopup{constructor(e){this.window=e,this.associatedEvent=null}close(){if(this.window)try{this.window.close()}catch(e){}}}function _open(e,i,s,o=500,l=600){const h=Math.max((window.screen.availHeight-l)/2,0).toString(),d=Math.max((window.screen.availWidth-o)/2,0).toString();let _="";const f=Object.assign(Object.assign({},at),{width:o.toString(),height:l.toString(),top:h,left:d}),g=getUA().toLowerCase();s&&(_=_isChromeIOS(g)?"_blank":s),_isFirefox(g)&&(i=i||"http://localhost",f.scrollbars="yes");const v=Object.entries(f).reduce((e,[i,s])=>`${e}${i}=${s},`,"");if(function(e=getUA()){var i;return _isIOS(e)&&!!(null===(i=window.navigator)||void 0===i?void 0:i.standalone)}(g)&&"_self"!==_)return function(e,i){const s=document.createElement("a");s.href=e,s.target=i;const o=document.createEvent("MouseEvent");o.initMouseEvent("click",!0,!0,window,1,0,0,0,0,!1,!1,!1,!1,1,null),s.dispatchEvent(o)}
/**
 * @license
 * Copyright 2021 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */(i||"",_),new AuthPopup(null);const w=window.open(i||"",_,v);_assert(w,e,"popup-blocked");try{w.focus()}catch(b){}return new AuthPopup(w)}const ct="__/auth/handler",ut="emulator/auth/handler",lt=encodeURIComponent("fac");async function _getRedirectUrl(e,i,s,o,l,h){_assert(e.config.authDomain,e,"auth-domain-config-required"),_assert(e.config.apiKey,e,"invalid-api-key");const d={apiKey:e.config.apiKey,appName:e.name,authType:s,redirectUrl:o,v:Ne,eventId:l};if(i instanceof FederatedAuthProvider){i.setDefaultLanguage(e.languageCode),d.providerId=i.providerId||"",function(e){for(const i in e)if(Object.prototype.hasOwnProperty.call(e,i))return!1;return!0}(i.getCustomParameters())||(d.customParameters=JSON.stringify(i.getCustomParameters()));for(const[e,i]of Object.entries(h||{}))d[e]=i}if(i instanceof BaseOAuthProvider){const e=i.getScopes().filter(e=>""!==e);e.length>0&&(d.scopes=e.join(","))}e.tenantId&&(d.tid=e.tenantId);const _=d;for(const v of Object.keys(_))void 0===_[v]&&delete _[v];const f=await e._getAppCheckToken(),g=f?`#${lt}=${encodeURIComponent(f)}`:"";return`${function({config:e}){if(!e.emulator)return`https://${e.authDomain}/${ct}`;return _emulatorUrl(e,ut)}
/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */(e)}?${querystring(_).slice(1)}${g}`}const ht="webStorageSupport";const dt=class{constructor(){this.eventManagers={},this.iframes={},this.originValidationPromises={},this._redirectPersistence=Ge,this._completeRedirectFn=_getRedirectResult,this._overrideRedirectResult=_overrideRedirectResult}async _openPopup(e,i,s,o){var l;debugAssert(null===(l=this.eventManagers[e._key()])||void 0===l?void 0:l.manager,"_initialize() not called before _openPopup()");return _open(e,await _getRedirectUrl(e,i,s,_getCurrentUrl(),o),_generateEventId())}async _openRedirect(e,i,s,o){await this._originValidation(e);return function(e){_window().location.href=e}(await _getRedirectUrl(e,i,s,_getCurrentUrl(),o)),new Promise(()=>{})}_initialize(e){const i=e._key();if(this.eventManagers[i]){const{manager:e,promise:s}=this.eventManagers[i];return e?Promise.resolve(e):(debugAssert(s,"If manager is not set, promise should be"),s)}const s=this.initAndGetManager(e);return this.eventManagers[i]={promise:s},s.catch(()=>{delete this.eventManagers[i]}),s}async initAndGetManager(e){const i=await _openIframe(e),s=new AuthEventManager(e);return i.register("authEvent",i=>{_assert(null==i?void 0:i.authEvent,e,"invalid-auth-event");return{status:s.onEvent(i.authEvent)?"ACK":"ERROR"}},gapi.iframes.CROSS_ORIGIN_IFRAMES_FILTER),this.eventManagers[e._key()]={manager:s},this.iframes[e._key()]=i,s}_isIframeWebStorageSupported(e,i){this.iframes[e._key()].send(ht,{type:ht},s=>{var o;const l=null===(o=null==s?void 0:s[0])||void 0===o?void 0:o[ht];void 0!==l&&i(!!l),_fail(e,"internal-error")},gapi.iframes.CROSS_ORIGIN_IFRAMES_FILTER)}_originValidation(e){const i=e._key();return this.originValidationPromises[i]||(this.originValidationPromises[i]=_validateOrigin(e)),this.originValidationPromises[i]}get _shouldInitProactively(){return _isMobileBrowser()||_isSafari()||_isIOS()}};var _t="@firebase/auth",pt="1.7.9";
/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
class AuthInterop{constructor(e){this.auth=e,this.internalListeners=new Map}getUid(){var e;return this.assertAuthConfigured(),(null===(e=this.auth.currentUser)||void 0===e?void 0:e.uid)||null}async getToken(e){if(this.assertAuthConfigured(),await this.auth._initializationPromise,!this.auth.currentUser)return null;return{accessToken:await this.auth.currentUser.getIdToken(e)}}addAuthTokenListener(e){if(this.assertAuthConfigured(),this.internalListeners.has(e))return;const i=this.auth.onIdTokenChanged(i=>{e((null==i?void 0:i.stsTokenManager.accessToken)||null)});this.internalListeners.set(e,i),this.updateProactiveRefresh()}removeAuthTokenListener(e){this.assertAuthConfigured();const i=this.internalListeners.get(e);i&&(this.internalListeners.delete(e),i(),this.updateProactiveRefresh())}assertAuthConfigured(){_assert(this.auth._initializationPromise,"dependent-sdk-initialized-before-auth")}updateProactiveRefresh(){this.internalListeners.size>0?this.auth._startProactiveRefresh():this.auth._stopProactiveRefresh()}}
/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
/**
 * @license
 * Copyright 2021 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
const ft=getExperimentalSetting("authIdTokenMaxAge")||300;let mt=null;function getAuth(e=getApp()){const i=_getProvider(e,"auth");if(i.isInitialized())return i.getImmediate();const s=function(e,i){const s=_getProvider(e,"auth");if(s.isInitialized()){const e=s.getImmediate();if(deepEqual(s.getOptions(),null!=i?i:{}))return e;_fail(e,"already-initialized")}return s.initialize({options:i})}(e,{popupRedirectResolver:dt,persistence:[Xe,$e,Ge]}),o=getExperimentalSetting("authTokenSyncURL");if(o&&"boolean"==typeof isSecureContext&&isSecureContext){const e=new URL(o,location.origin);if(location.origin===e.origin){const i=(l=e.toString(),async e=>{const i=e&&await e.getIdTokenResult(),s=i&&((new Date).getTime()-Date.parse(i.issuedAtTime))/1e3;if(s&&s>ft)return;const o=null==i?void 0:i.token;mt!==o&&(mt=o,await fetch(l,{method:o?"POST":"DELETE",headers:o?{Authorization:`Bearer ${o}`}:{}}))});!function(e,i,s){getModularInstance(e).beforeAuthStateChanged(i,s)}(s,i,()=>i(s.currentUser)),function(e,i,s,o){getModularInstance(e).onIdTokenChanged(i,s,o)}(s,e=>i(e))}}var l;const h=getDefaultEmulatorHost("auth");return h&&connectAuthEmulator(s,`http://${h}`),s}var gt;We={loadJS:e=>new Promise((i,s)=>{const o=document.createElement("script");var l,h;o.setAttribute("src",e),o.onload=i,o.onerror=e=>{const i=_createError("internal-error");i.customData=e,s(i)},o.type="text/javascript",o.charset="UTF-8",(null!==(h=null===(l=document.getElementsByTagName("head"))||void 0===l?void 0:l[0])&&void 0!==h?h:document).appendChild(o)}),gapiScript:"https://apis.google.com/js/api.js",recaptchaV2Script:"https://www.google.com/recaptcha/api.js",recaptchaEnterpriseScript:"https://www.google.com/recaptcha/enterprise.js?render="},gt="Browser",_registerComponent(new Component("auth",(e,{options:i})=>{const s=e.getProvider("app").getImmediate(),o=e.getProvider("heartbeat"),l=e.getProvider("app-check-internal"),{apiKey:h,authDomain:d}=s.options;_assert(h&&!h.includes(":"),"invalid-api-key",{appName:s.name});const _={apiKey:h,authDomain:d,clientPlatform:gt,apiHost:"identitytoolkit.googleapis.com",tokenApiHost:"securetoken.googleapis.com",apiScheme:"https",sdkClientVersion:_getClientVersion(gt)},f=new AuthImpl(s,o,l,_);return function(e,i){const s=(null==i?void 0:i.persistence)||[],o=(Array.isArray(s)?s:[s]).map(_getInstance);(null==i?void 0:i.errorMap)&&e._updateErrorMap(i.errorMap),e._initializeWithPersistence(o,null==i?void 0:i.popupRedirectResolver)}(f,i),f},"PUBLIC").setInstantiationMode("EXPLICIT").setInstanceCreatedCallback((e,i,s)=>{e.getProvider("auth-internal").initialize()})),_registerComponent(new Component("auth-internal",e=>{const i=_castAuth(e.getProvider("auth").getImmediate());return new AuthInterop(i)},"PRIVATE").setInstantiationMode("EXPLICIT")),registerVersion(_t,pt,function(e){switch(e){case"Node":return"node";case"ReactNative":return"rn";case"Worker":return"webworker";case"Cordova":return"cordova";case"WebExtension":return"web-extension";default:return}}(gt)),registerVersion(_t,pt,"esm2017");var Et,It,yt="undefined"!=typeof globalThis?globalThis:"undefined"!=typeof window?window:"undefined"!=typeof global?global:"undefined"!=typeof self?self:{};
/** @license
Copyright The Closure Library Authors.
SPDX-License-Identifier: Apache-2.0
*/(function(){var e;
/** @license
  
   Copyright The Closure Library Authors.
   SPDX-License-Identifier: Apache-2.0
  */function m(){this.blockSize=-1,this.blockSize=64,this.g=Array(4),this.B=Array(this.blockSize),this.o=this.h=0,this.s()}function n(e,i,s){s||(s=0);var o=Array(16);if("string"==typeof i)for(var l=0;16>l;++l)o[l]=i.charCodeAt(s++)|i.charCodeAt(s++)<<8|i.charCodeAt(s++)<<16|i.charCodeAt(s++)<<24;else for(l=0;16>l;++l)o[l]=i[s++]|i[s++]<<8|i[s++]<<16|i[s++]<<24;i=e.g[0],s=e.g[1],l=e.g[2];var h=e.g[3],d=i+(h^s&(l^h))+o[0]+3614090360&4294967295;d=(s=(l=(h=(i=(s=(l=(h=(i=(s=(l=(h=(i=(s=(l=(h=(i=(s=(l=(h=(i=(s=(l=(h=(i=(s=(l=(h=(i=(s=(l=(h=(i=(s=(l=(h=(i=(s=(l=(h=(i=(s=(l=(h=(i=(s=(l=(h=(i=(s=(l=(h=(i=(s=(l=(h=(i=(s=(l=(h=(i=s+(d<<7&4294967295|d>>>25))+((d=h+(l^i&(s^l))+o[1]+3905402710&4294967295)<<12&4294967295|d>>>20))+((d=l+(s^h&(i^s))+o[2]+606105819&4294967295)<<17&4294967295|d>>>15))+((d=s+(i^l&(h^i))+o[3]+3250441966&4294967295)<<22&4294967295|d>>>10))+((d=i+(h^s&(l^h))+o[4]+4118548399&4294967295)<<7&4294967295|d>>>25))+((d=h+(l^i&(s^l))+o[5]+1200080426&4294967295)<<12&4294967295|d>>>20))+((d=l+(s^h&(i^s))+o[6]+2821735955&4294967295)<<17&4294967295|d>>>15))+((d=s+(i^l&(h^i))+o[7]+4249261313&4294967295)<<22&4294967295|d>>>10))+((d=i+(h^s&(l^h))+o[8]+1770035416&4294967295)<<7&4294967295|d>>>25))+((d=h+(l^i&(s^l))+o[9]+2336552879&4294967295)<<12&4294967295|d>>>20))+((d=l+(s^h&(i^s))+o[10]+4294925233&4294967295)<<17&4294967295|d>>>15))+((d=s+(i^l&(h^i))+o[11]+2304563134&4294967295)<<22&4294967295|d>>>10))+((d=i+(h^s&(l^h))+o[12]+1804603682&4294967295)<<7&4294967295|d>>>25))+((d=h+(l^i&(s^l))+o[13]+4254626195&4294967295)<<12&4294967295|d>>>20))+((d=l+(s^h&(i^s))+o[14]+2792965006&4294967295)<<17&4294967295|d>>>15))+((d=s+(i^l&(h^i))+o[15]+1236535329&4294967295)<<22&4294967295|d>>>10))+((d=i+(l^h&(s^l))+o[1]+4129170786&4294967295)<<5&4294967295|d>>>27))+((d=h+(s^l&(i^s))+o[6]+3225465664&4294967295)<<9&4294967295|d>>>23))+((d=l+(i^s&(h^i))+o[11]+643717713&4294967295)<<14&4294967295|d>>>18))+((d=s+(h^i&(l^h))+o[0]+3921069994&4294967295)<<20&4294967295|d>>>12))+((d=i+(l^h&(s^l))+o[5]+3593408605&4294967295)<<5&4294967295|d>>>27))+((d=h+(s^l&(i^s))+o[10]+38016083&4294967295)<<9&4294967295|d>>>23))+((d=l+(i^s&(h^i))+o[15]+3634488961&4294967295)<<14&4294967295|d>>>18))+((d=s+(h^i&(l^h))+o[4]+3889429448&4294967295)<<20&4294967295|d>>>12))+((d=i+(l^h&(s^l))+o[9]+568446438&4294967295)<<5&4294967295|d>>>27))+((d=h+(s^l&(i^s))+o[14]+3275163606&4294967295)<<9&4294967295|d>>>23))+((d=l+(i^s&(h^i))+o[3]+4107603335&4294967295)<<14&4294967295|d>>>18))+((d=s+(h^i&(l^h))+o[8]+1163531501&4294967295)<<20&4294967295|d>>>12))+((d=i+(l^h&(s^l))+o[13]+2850285829&4294967295)<<5&4294967295|d>>>27))+((d=h+(s^l&(i^s))+o[2]+4243563512&4294967295)<<9&4294967295|d>>>23))+((d=l+(i^s&(h^i))+o[7]+1735328473&4294967295)<<14&4294967295|d>>>18))+((d=s+(h^i&(l^h))+o[12]+2368359562&4294967295)<<20&4294967295|d>>>12))+((d=i+(s^l^h)+o[5]+4294588738&4294967295)<<4&4294967295|d>>>28))+((d=h+(i^s^l)+o[8]+2272392833&4294967295)<<11&4294967295|d>>>21))+((d=l+(h^i^s)+o[11]+1839030562&4294967295)<<16&4294967295|d>>>16))+((d=s+(l^h^i)+o[14]+4259657740&4294967295)<<23&4294967295|d>>>9))+((d=i+(s^l^h)+o[1]+2763975236&4294967295)<<4&4294967295|d>>>28))+((d=h+(i^s^l)+o[4]+1272893353&4294967295)<<11&4294967295|d>>>21))+((d=l+(h^i^s)+o[7]+4139469664&4294967295)<<16&4294967295|d>>>16))+((d=s+(l^h^i)+o[10]+3200236656&4294967295)<<23&4294967295|d>>>9))+((d=i+(s^l^h)+o[13]+681279174&4294967295)<<4&4294967295|d>>>28))+((d=h+(i^s^l)+o[0]+3936430074&4294967295)<<11&4294967295|d>>>21))+((d=l+(h^i^s)+o[3]+3572445317&4294967295)<<16&4294967295|d>>>16))+((d=s+(l^h^i)+o[6]+76029189&4294967295)<<23&4294967295|d>>>9))+((d=i+(s^l^h)+o[9]+3654602809&4294967295)<<4&4294967295|d>>>28))+((d=h+(i^s^l)+o[12]+3873151461&4294967295)<<11&4294967295|d>>>21))+((d=l+(h^i^s)+o[15]+530742520&4294967295)<<16&4294967295|d>>>16))+((d=s+(l^h^i)+o[2]+3299628645&4294967295)<<23&4294967295|d>>>9))+((d=i+(l^(s|~h))+o[0]+4096336452&4294967295)<<6&4294967295|d>>>26))+((d=h+(s^(i|~l))+o[7]+1126891415&4294967295)<<10&4294967295|d>>>22))+((d=l+(i^(h|~s))+o[14]+2878612391&4294967295)<<15&4294967295|d>>>17))+((d=s+(h^(l|~i))+o[5]+4237533241&4294967295)<<21&4294967295|d>>>11))+((d=i+(l^(s|~h))+o[12]+1700485571&4294967295)<<6&4294967295|d>>>26))+((d=h+(s^(i|~l))+o[3]+2399980690&4294967295)<<10&4294967295|d>>>22))+((d=l+(i^(h|~s))+o[10]+4293915773&4294967295)<<15&4294967295|d>>>17))+((d=s+(h^(l|~i))+o[1]+2240044497&4294967295)<<21&4294967295|d>>>11))+((d=i+(l^(s|~h))+o[8]+1873313359&4294967295)<<6&4294967295|d>>>26))+((d=h+(s^(i|~l))+o[15]+4264355552&4294967295)<<10&4294967295|d>>>22))+((d=l+(i^(h|~s))+o[6]+2734768916&4294967295)<<15&4294967295|d>>>17))+((d=s+(h^(l|~i))+o[13]+1309151649&4294967295)<<21&4294967295|d>>>11))+((h=(i=s+((d=i+(l^(s|~h))+o[4]+4149444226&4294967295)<<6&4294967295|d>>>26))+((d=h+(s^(i|~l))+o[11]+3174756917&4294967295)<<10&4294967295|d>>>22))^((l=h+((d=l+(i^(h|~s))+o[2]+718787259&4294967295)<<15&4294967295|d>>>17))|~i))+o[9]+3951481745&4294967295,e.g[0]=e.g[0]+i&4294967295,e.g[1]=e.g[1]+(l+(d<<21&4294967295|d>>>11))&4294967295,e.g[2]=e.g[2]+l&4294967295,e.g[3]=e.g[3]+h&4294967295}function t(e,i){this.h=i;for(var s=[],o=!0,l=e.length-1;0<=l;l--){var h=0|e[l];o&&h==i||(s[l]=h,o=!1)}this.g=s}!function(e,i){function c(){}c.prototype=i.prototype,e.D=i.prototype,e.prototype=new c,e.prototype.constructor=e,e.C=function(e,s,o){for(var l=Array(arguments.length-2),h=2;h<arguments.length;h++)l[h-2]=arguments[h];return i.prototype[s].apply(e,l)}}(m,function(){this.blockSize=-1}),m.prototype.s=function(){this.g[0]=1732584193,this.g[1]=4023233417,this.g[2]=2562383102,this.g[3]=271733878,this.o=this.h=0},m.prototype.u=function(e,i){void 0===i&&(i=e.length);for(var s=i-this.blockSize,o=this.B,l=this.h,h=0;h<i;){if(0==l)for(;h<=s;)n(this,e,h),h+=this.blockSize;if("string"==typeof e){for(;h<i;)if(o[l++]=e.charCodeAt(h++),l==this.blockSize){n(this,o),l=0;break}}else for(;h<i;)if(o[l++]=e[h++],l==this.blockSize){n(this,o),l=0;break}}this.h=l,this.o+=i},m.prototype.v=function(){var e=Array((56>this.h?this.blockSize:2*this.blockSize)-this.h);e[0]=128;for(var i=1;i<e.length-8;++i)e[i]=0;var s=8*this.o;for(i=e.length-8;i<e.length;++i)e[i]=255&s,s/=256;for(this.u(e),e=Array(16),i=s=0;4>i;++i)for(var o=0;32>o;o+=8)e[s++]=this.g[i]>>>o&255;return e};var i={};function u(e){return-128<=e&&128>e?function(e,s){var o=i;return Object.prototype.hasOwnProperty.call(o,e)?o[e]:o[e]=s(e)}(e,function(e){return new t([0|e],0>e?-1:0)}):new t([0|e],0>e?-1:0)}function v2(e){if(isNaN(e)||!isFinite(e))return s;if(0>e)return x(v2(-e));for(var i=[],o=1,l=0;e>=o;l++)i[l]=e/o|0,o*=4294967296;return new t(i,0)}var s=u(0),o=u(1),l=u(16777216);function C2(e){if(0!=e.h)return!1;for(var i=0;i<e.g.length;i++)if(0!=e.g[i])return!1;return!0}function B(e){return-1==e.h}function x(e){for(var i=e.g.length,s=[],l=0;l<i;l++)s[l]=~e.g[l];return new t(s,~e.h).add(o)}function F(e,i){return e.add(x(i))}function G(e,i){for(;(65535&e[i])!=e[i];)e[i+1]+=e[i]>>>16,e[i]&=65535,i++}function H(e,i){this.g=e,this.h=i}function D2(e,i){if(C2(i))throw Error("division by zero");if(C2(e))return new H(s,s);if(B(e))return i=D2(x(e),i),new H(x(i.g),x(i.h));if(B(i))return i=D2(e,x(i)),new H(x(i.g),i.h);if(30<e.g.length){if(B(e)||B(i))throw Error("slowDivide_ only works with positive integers.");for(var l=o,h=i;0>=h.l(e);)l=I(l),h=I(h);var d=J(l,1),_=J(h,1);for(h=J(h,2),l=J(l,2);!C2(h);){var f=_.add(h);0>=f.l(e)&&(d=d.add(l),_=f),h=J(h,1),l=J(l,1)}return i=F(e,d.j(i)),new H(d,i)}for(d=s;0<=e.l(i);){for(l=Math.max(1,Math.floor(e.m()/i.m())),h=48>=(h=Math.ceil(Math.log(l)/Math.LN2))?1:Math.pow(2,h-48),f=(_=v2(l)).j(i);B(f)||0<f.l(e);)f=(_=v2(l-=h)).j(i);C2(_)&&(_=o),d=d.add(_),e=F(e,f)}return new H(d,e)}function I(e){for(var i=e.g.length+1,s=[],o=0;o<i;o++)s[o]=e.i(o)<<1|e.i(o-1)>>>31;return new t(s,e.h)}function J(e,i){var s=i>>5;i%=32;for(var o=e.g.length-s,l=[],h=0;h<o;h++)l[h]=0<i?e.i(h+s)>>>i|e.i(h+s+1)<<32-i:e.i(h+s);return new t(l,e.h)}(e=t.prototype).m=function(){if(B(this))return-x(this).m();for(var e=0,i=1,s=0;s<this.g.length;s++){var o=this.i(s);e+=(0<=o?o:4294967296+o)*i,i*=4294967296}return e},e.toString=function(e){if(2>(e=e||10)||36<e)throw Error("radix out of range: "+e);if(C2(this))return"0";if(B(this))return"-"+x(this).toString(e);for(var i=v2(Math.pow(e,6)),s=this,o="";;){var l=D2(s,i).g,h=((0<(s=F(s,l.j(i))).g.length?s.g[0]:s.h)>>>0).toString(e);if(C2(s=l))return h+o;for(;6>h.length;)h="0"+h;o=h+o}},e.i=function(e){return 0>e?0:e<this.g.length?this.g[e]:this.h},e.l=function(e){return B(e=F(this,e))?-1:C2(e)?0:1},e.abs=function(){return B(this)?x(this):this},e.add=function(e){for(var i=Math.max(this.g.length,e.g.length),s=[],o=0,l=0;l<=i;l++){var h=o+(65535&this.i(l))+(65535&e.i(l)),d=(h>>>16)+(this.i(l)>>>16)+(e.i(l)>>>16);o=d>>>16,h&=65535,d&=65535,s[l]=d<<16|h}return new t(s,-2147483648&s[s.length-1]?-1:0)},e.j=function(e){if(C2(this)||C2(e))return s;if(B(this))return B(e)?x(this).j(x(e)):x(x(this).j(e));if(B(e))return x(this.j(x(e)));if(0>this.l(l)&&0>e.l(l))return v2(this.m()*e.m());for(var i=this.g.length+e.g.length,o=[],h=0;h<2*i;h++)o[h]=0;for(h=0;h<this.g.length;h++)for(var d=0;d<e.g.length;d++){var _=this.i(h)>>>16,f=65535&this.i(h),g=e.i(d)>>>16,v=65535&e.i(d);o[2*h+2*d]+=f*v,G(o,2*h+2*d),o[2*h+2*d+1]+=_*v,G(o,2*h+2*d+1),o[2*h+2*d+1]+=f*g,G(o,2*h+2*d+1),o[2*h+2*d+2]+=_*g,G(o,2*h+2*d+2)}for(h=0;h<i;h++)o[h]=o[2*h+1]<<16|o[2*h];for(h=i;h<2*i;h++)o[h]=0;return new t(o,0)},e.A=function(e){return D2(this,e).h},e.and=function(e){for(var i=Math.max(this.g.length,e.g.length),s=[],o=0;o<i;o++)s[o]=this.i(o)&e.i(o);return new t(s,this.h&e.h)},e.or=function(e){for(var i=Math.max(this.g.length,e.g.length),s=[],o=0;o<i;o++)s[o]=this.i(o)|e.i(o);return new t(s,this.h|e.h)},e.xor=function(e){for(var i=Math.max(this.g.length,e.g.length),s=[],o=0;o<i;o++)s[o]=this.i(o)^e.i(o);return new t(s,this.h^e.h)},m.prototype.digest=m.prototype.v,m.prototype.reset=m.prototype.s,m.prototype.update=m.prototype.u,It=m,t.prototype.add=t.prototype.add,t.prototype.multiply=t.prototype.j,t.prototype.modulo=t.prototype.A,t.prototype.compare=t.prototype.l,t.prototype.toNumber=t.prototype.m,t.prototype.toString=t.prototype.toString,t.prototype.getBits=t.prototype.i,t.fromNumber=v2,t.fromString=function y(e,i){if(0==e.length)throw Error("number format error: empty string");if(2>(i=i||10)||36<i)throw Error("radix out of range: "+i);if("-"==e.charAt(0))return x(y(e.substring(1),i));if(0<=e.indexOf("-"))throw Error('number format error: interior "-" character');for(var o=v2(Math.pow(i,8)),l=s,h=0;h<e.length;h+=8){var d=Math.min(8,e.length-h),_=parseInt(e.substring(h,h+d),i);8>d?(d=v2(Math.pow(i,d)),l=l.j(d).add(v2(_))):l=(l=l.j(o)).add(v2(_))}return l},Et=t}).apply(void 0!==yt?yt:"undefined"!=typeof self?self:"undefined"!=typeof window?window:{});var Tt,At,Pt,vt,Rt,wt,Vt,bt,St="undefined"!=typeof globalThis?globalThis:"undefined"!=typeof window?window:"undefined"!=typeof global?global:"undefined"!=typeof self?self:{};
/** @license
Copyright The Closure Library Authors.
SPDX-License-Identifier: Apache-2.0
*/(function(){var e,i="function"==typeof Object.defineProperties?Object.defineProperty:function(e,i,s){return e==Array.prototype||e==Object.prototype||(e[i]=s.value),e};var s=function(e){e=["object"==typeof globalThis&&globalThis,e,"object"==typeof window&&window,"object"==typeof self&&self,"object"==typeof St&&St];for(var i=0;i<e.length;++i){var s=e[i];if(s&&s.Math==Math)return s}throw Error("Cannot find global object")}(this);!function(e,o){if(o)e:{var l=s;e=e.split(".");for(var h=0;h<e.length-1;h++){var d=e[h];if(!(d in l))break e;l=l[d]}(o=o(h=l[e=e[e.length-1]]))!=h&&null!=o&&i(l,e,{configurable:!0,writable:!0,value:o})}}("Array.prototype.values",function(e){return e||function(){return function(e,i){e instanceof String&&(e+="");var s=0,o=!1,l={next:function(){if(!o&&s<e.length){var l=s++;return{value:i(l,e[l]),done:!1}}return o=!0,{done:!0,value:void 0}}};return l[Symbol.iterator]=function(){return l},l}(this,function(e,i){return i})}});
/** @license
  
   Copyright The Closure Library Authors.
   SPDX-License-Identifier: Apache-2.0
  */
var o=o||{},l=this||self;function ha(e){var i=typeof e;return"array"==(i="object"!=i?i:e?Array.isArray(e)?"array":i:"null")||"object"==i&&"number"==typeof e.length}function n(e){var i=typeof e;return"object"==i&&null!=e||"function"==i}function ia(e,i,s){return e.call.apply(e.bind,arguments)}function ja(e,i,s){if(!e)throw Error();if(2<arguments.length){var o=Array.prototype.slice.call(arguments,2);return function(){var s=Array.prototype.slice.call(arguments);return Array.prototype.unshift.apply(s,o),e.apply(i,s)}}return function(){return e.apply(i,arguments)}}function p(e,i,s){return(p=Function.prototype.bind&&-1!=Function.prototype.bind.toString().indexOf("native code")?ia:ja).apply(null,arguments)}function ka(e,i){var s=Array.prototype.slice.call(arguments,1);return function(){var i=s.slice();return i.push.apply(i,arguments),e.apply(this,i)}}function r(e,i){function c(){}c.prototype=i.prototype,e.aa=i.prototype,e.prototype=new c,e.prototype.constructor=e,e.Qb=function(e,s,o){for(var l=Array(arguments.length-2),h=2;h<arguments.length;h++)l[h-2]=arguments[h];return i.prototype[s].apply(e,l)}}function la(e){const i=e.length;if(0<i){const s=Array(i);for(let o=0;o<i;o++)s[o]=e[o];return s}return[]}function ma(e,i){for(let s=1;s<arguments.length;s++){const i=arguments[s];if(ha(i)){const s=e.length||0,o=i.length||0;e.length=s+o;for(let l=0;l<o;l++)e[s+l]=i[l]}else e.push(i)}}function t(e){return/^[\s\xa0]*$/.test(e)}function u(){var e=l.navigator;return e&&(e=e.userAgent)?e:""}function oa(e){return oa[" "](e),e}oa[" "]=function(){};var h=!(-1==u().indexOf("Gecko")||-1!=u().toLowerCase().indexOf("webkit")&&-1==u().indexOf("Edge")||-1!=u().indexOf("Trident")||-1!=u().indexOf("MSIE")||-1!=u().indexOf("Edge"));function qa(e,i,s){for(const o in e)i.call(s,e[o],o,e)}function sa(e){const i={};for(const s in e)i[s]=e[s];return i}const d="constructor hasOwnProperty isPrototypeOf propertyIsEnumerable toLocaleString toString valueOf".split(" ");function ua(e,i){let s,o;for(let l=1;l<arguments.length;l++){for(s in o=arguments[l],o)e[s]=o[s];for(let i=0;i<d.length;i++)s=d[i],Object.prototype.hasOwnProperty.call(o,s)&&(e[s]=o[s])}}function va(e){var i=1;e=e.split(":");const s=[];for(;0<i&&e.length;)s.push(e.shift()),i--;return e.length&&s.push(e.join(":")),s}function wa(e){l.setTimeout(()=>{throw e},0)}function xa(){var e=v;let i=null;return e.g&&(i=e.g,e.g=e.g.next,e.g||(e.h=null),i.next=null),i}var _=new class{constructor(e,i){this.i=e,this.j=i,this.h=0,this.g=null}get(){let e;return 0<this.h?(this.h--,e=this.g,this.g=e.next,e.next=null):e=this.i(),e}}(()=>new Ca,e=>e.reset());class Ca{constructor(){this.next=this.g=this.h=null}set(e,i){this.h=e,this.g=i,this.next=null}reset(){this.next=this.g=this.h=null}}let f,g=!1,v=new class{constructor(){this.h=this.g=null}add(e,i){const s=_.get();s.set(e,i),this.h?this.h.next=s:this.g=s,this.h=s}},Ea=()=>{const e=l.Promise.resolve(void 0);f=()=>{e.then(Da)}};var Da=()=>{for(var e;e=xa();){try{e.h.call(e.g)}catch(s){wa(s)}var i=_;i.j(e),100>i.h&&(i.h++,e.next=i.g,i.g=e)}g=!1};function z(){this.s=this.s,this.C=this.C}function A(e,i){this.type=e,this.g=this.target=i,this.defaultPrevented=!1}z.prototype.s=!1,z.prototype.ma=function(){this.s||(this.s=!0,this.N())},z.prototype.N=function(){if(this.C)for(;this.C.length;)this.C.shift()()},A.prototype.h=function(){this.defaultPrevented=!0};var w=function(){if(!l.addEventListener||!Object.defineProperty)return!1;var e=!1,i=Object.defineProperty({},"passive",{get:function(){e=!0}});try{const c=()=>{};l.addEventListener("test",c,i),l.removeEventListener("test",c,i)}catch(s){}return e}();function C2(e,i){if(A.call(this,e?e.type:""),this.relatedTarget=this.g=this.target=null,this.button=this.screenY=this.screenX=this.clientY=this.clientX=0,this.key="",this.metaKey=this.shiftKey=this.altKey=this.ctrlKey=!1,this.state=null,this.pointerId=0,this.pointerType="",this.i=null,e){var s=this.type=e.type,o=e.changedTouches&&e.changedTouches.length?e.changedTouches[0]:null;if(this.target=e.target||e.srcElement,this.g=i,i=e.relatedTarget){if(h){e:{try{oa(i.nodeName);var l=!0;break e}catch(d){}l=!1}l||(i=null)}}else"mouseover"==s?i=e.fromElement:"mouseout"==s&&(i=e.toElement);this.relatedTarget=i,o?(this.clientX=void 0!==o.clientX?o.clientX:o.pageX,this.clientY=void 0!==o.clientY?o.clientY:o.pageY,this.screenX=o.screenX||0,this.screenY=o.screenY||0):(this.clientX=void 0!==e.clientX?e.clientX:e.pageX,this.clientY=void 0!==e.clientY?e.clientY:e.pageY,this.screenX=e.screenX||0,this.screenY=e.screenY||0),this.button=e.button,this.key=e.key||"",this.ctrlKey=e.ctrlKey,this.altKey=e.altKey,this.shiftKey=e.shiftKey,this.metaKey=e.metaKey,this.pointerId=e.pointerId||0,this.pointerType="string"==typeof e.pointerType?e.pointerType:b[e.pointerType]||"",this.state=e.state,this.i=e,e.defaultPrevented&&C2.aa.h.call(this)}}r(C2,A);var b={2:"touch",3:"pen",4:"mouse"};C2.prototype.h=function(){C2.aa.h.call(this);var e=this.i;e.preventDefault?e.preventDefault():e.returnValue=!1};var S="closure_listenable_"+(1e6*Math.random()|0),C=0;function Ia(e,i,s,o,l){this.listener=e,this.proxy=null,this.src=i,this.type=s,this.capture=!!o,this.ha=l,this.key=++C,this.da=this.fa=!1}function Ja(e){e.da=!0,e.listener=null,e.proxy=null,e.src=null,e.ha=null}function Ka(e){this.src=e,this.g={},this.h=0}function Ma(e,i){var s=i.type;if(s in e.g){var o,l=e.g[s],h=Array.prototype.indexOf.call(l,i,void 0);(o=0<=h)&&Array.prototype.splice.call(l,h,1),o&&(Ja(i),0==e.g[s].length&&(delete e.g[s],e.h--))}}function La(e,i,s,o){for(var l=0;l<e.length;++l){var h=e[l];if(!h.da&&h.listener==i&&h.capture==!!s&&h.ha==o)return l}return-1}Ka.prototype.add=function(e,i,s,o,l){var h=e.toString();(e=this.g[h])||(e=this.g[h]=[],this.h++);var d=La(e,i,o,l);return-1<d?(i=e[d],s||(i.fa=!1)):((i=new Ia(i,this.src,h,!!o,l)).fa=s,e.push(i)),i};var D="closure_lm_"+(1e6*Math.random()|0),k={};function Qa(e,i,s,o,l){if(o&&o.once)return Ra(e,i,s,o,l);if(Array.isArray(i)){for(var h=0;h<i.length;h++)Qa(e,i[h],s,o,l);return null}return s=Sa(s),e&&e[S]?e.K(i,s,n(o)?!!o.capture:!!o,l):Ta(e,i,s,!1,o,l)}function Ta(e,i,s,o,l,h){if(!i)throw Error("Invalid event type");var d=n(l)?!!l.capture:!!l,_=Ua(e);if(_||(e[D]=_=new Ka(e)),(s=_.add(i,s,o,d,h)).proxy)return s;if(o=function(){function a(i){return e.call(a.src,a.listener,i)}const e=Xa;return a}(),s.proxy=o,o.src=e,o.listener=s,e.addEventListener)w||(l=d),void 0===l&&(l=!1),e.addEventListener(i.toString(),o,l);else if(e.attachEvent)e.attachEvent(Wa(i.toString()),o);else{if(!e.addListener||!e.removeListener)throw Error("addEventListener and attachEvent are unavailable.");e.addListener(o)}return s}function Ra(e,i,s,o,l){if(Array.isArray(i)){for(var h=0;h<i.length;h++)Ra(e,i[h],s,o,l);return null}return s=Sa(s),e&&e[S]?e.L(i,s,n(o)?!!o.capture:!!o,l):Ta(e,i,s,!0,o,l)}function Ya(e,i,s,o,l){if(Array.isArray(i))for(var h=0;h<i.length;h++)Ya(e,i[h],s,o,l);else o=n(o)?!!o.capture:!!o,s=Sa(s),e&&e[S]?(e=e.i,(i=String(i).toString())in e.g&&(-1<(s=La(h=e.g[i],s,o,l))&&(Ja(h[s]),Array.prototype.splice.call(h,s,1),0==h.length&&(delete e.g[i],e.h--)))):e&&(e=Ua(e))&&(i=e.g[i.toString()],e=-1,i&&(e=La(i,s,o,l)),(s=-1<e?i[e]:null)&&Za(s))}function Za(e){if("number"!=typeof e&&e&&!e.da){var i=e.src;if(i&&i[S])Ma(i.i,e);else{var s=e.type,o=e.proxy;i.removeEventListener?i.removeEventListener(s,o,e.capture):i.detachEvent?i.detachEvent(Wa(s),o):i.addListener&&i.removeListener&&i.removeListener(o),(s=Ua(i))?(Ma(s,e),0==s.h&&(s.src=null,i[D]=null)):Ja(e)}}}function Wa(e){return e in k?k[e]:k[e]="on"+e}function Xa(e,i){if(e.da)e=!0;else{i=new C2(i,this);var s=e.listener,o=e.ha||e.src;e.fa&&Za(e),e=s.call(o,i)}return e}function Ua(e){return(e=e[D])instanceof Ka?e:null}var O="__closure_events_fn_"+(1e9*Math.random()>>>0);function Sa(e){return"function"==typeof e?e:(e[O]||(e[O]=function(i){return e.handleEvent(i)}),e[O])}function E(){z.call(this),this.i=new Ka(this),this.M=this,this.F=null}function F(e,i){var s,o=e.F;if(o)for(s=[];o;o=o.F)s.push(o);if(e=e.M,o=i.type||i,"string"==typeof i)i=new A(i,e);else if(i instanceof A)i.target=i.target||e;else{var l=i;ua(i=new A(o,e),l)}if(l=!0,s)for(var h=s.length-1;0<=h;h--){var d=i.g=s[h];l=ab(d,o,!0,i)&&l}if(l=ab(d=i.g=e,o,!0,i)&&l,l=ab(d,o,!1,i)&&l,s)for(h=0;h<s.length;h++)l=ab(d=i.g=s[h],o,!1,i)&&l}function ab(e,i,s,o){if(!(i=e.i.g[String(i)]))return!0;i=i.concat();for(var l=!0,h=0;h<i.length;++h){var d=i[h];if(d&&!d.da&&d.capture==s){var _=d.listener,f=d.ha||d.src;d.fa&&Ma(e.i,d),l=!1!==_.call(f,o)&&l}}return l&&!o.defaultPrevented}function bb(e,i,s){if("function"==typeof e)s&&(e=p(e,s));else{if(!e||"function"!=typeof e.handleEvent)throw Error("Invalid listener argument");e=p(e.handleEvent,e)}return 2147483647<Number(i)?-1:l.setTimeout(e,i||0)}function cb(e){e.g=bb(()=>{e.g=null,e.i&&(e.i=!1,cb(e))},e.l);const i=e.h;e.h=null,e.m.apply(null,i)}r(E,z),E.prototype[S]=!0,E.prototype.removeEventListener=function(e,i,s,o){Ya(this,e,i,s,o)},E.prototype.N=function(){if(E.aa.N.call(this),this.i){var e,i=this.i;for(e in i.g){for(var s=i.g[e],o=0;o<s.length;o++)Ja(s[o]);delete i.g[e],i.h--}}this.F=null},E.prototype.K=function(e,i,s,o){return this.i.add(String(e),i,!1,s,o)},E.prototype.L=function(e,i,s,o){return this.i.add(String(e),i,!0,s,o)};class eb extends z{constructor(e,i){super(),this.m=e,this.l=i,this.h=null,this.i=!1,this.g=null}j(e){this.h=arguments,this.g?this.i=!0:cb(this)}N(){super.N(),this.g&&(l.clearTimeout(this.g),this.g=null,this.i=!1,this.h=null)}}function G(e){z.call(this),this.h=e,this.g={}}r(G,z);var q=[];function gb(e){qa(e.g,function(e,i){this.g.hasOwnProperty(i)&&Za(e)},e),e.g={}}G.prototype.N=function(){G.aa.N.call(this),gb(this)},G.prototype.handleEvent=function(){throw Error("EventHandler.handleEvent not implemented")};var j=l.JSON.stringify,$=l.JSON.parse,ee=class{stringify(e){return l.JSON.stringify(e,void 0)}parse(e){return l.JSON.parse(e,void 0)}};function kb(){}function lb(e){return e.h||(e.h=e.i())}function mb(){}kb.prototype.h=null;var te={OPEN:"a",kb:"b",Ja:"c",wb:"d"};function nb(){A.call(this,"d")}function ob(){A.call(this,"c")}r(nb,A),r(ob,A);var re={},ne=null;function qb(){return ne=ne||new E}function rb(e){A.call(this,re.La,e)}function J(e){const i=qb();F(i,new rb(i))}function sb(e,i){A.call(this,re.STAT_EVENT,e),this.stat=i}function K(e){const i=qb();F(i,new sb(i,e))}function tb(e,i){A.call(this,re.Ma,e),this.size=i}function ub(e,i){if("function"!=typeof e)throw Error("Fn must not be null and must be a function");return l.setTimeout(function(){e()},i)}function vb(){this.g=!0}function L(e,i,s,o){e.info(function(){return"XMLHTTP TEXT ("+i+"): "+function(e,i){if(!e.g)return i;if(!i)return null;try{var s=JSON.parse(i);if(s)for(e=0;e<s.length;e++)if(Array.isArray(s[e])){var o=s[e];if(!(2>o.length)){var l=o[1];if(Array.isArray(l)&&!(1>l.length)){var h=l[0];if("noop"!=h&&"stop"!=h&&"close"!=h)for(var d=1;d<l.length;d++)l[d]=""}}}return j(s)}catch(_){return i}}(e,s)+(o?" "+o:"")})}re.La="serverreachability",r(rb,A),re.STAT_EVENT="statevent",r(sb,A),re.Ma="timingevent",r(tb,A),vb.prototype.xa=function(){this.g=!1},vb.prototype.info=function(){};var ie,se={NO_ERROR:0,gb:1,tb:2,sb:3,nb:4,rb:5,ub:6,Ia:7,TIMEOUT:8,xb:9},oe={lb:"complete",Hb:"success",Ja:"error",Ia:"abort",zb:"ready",Ab:"readystatechange",TIMEOUT:"timeout",vb:"incrementaldata",yb:"progress",ob:"downloadprogress",Pb:"uploadprogress"};function Db(){}function M(e,i,s,o){this.j=e,this.i=i,this.l=s,this.R=o||1,this.U=new G(this),this.I=45e3,this.H=null,this.o=!1,this.m=this.A=this.v=this.L=this.F=this.S=this.B=null,this.D=[],this.g=null,this.C=0,this.s=this.u=null,this.X=-1,this.J=!1,this.O=0,this.M=null,this.W=this.K=this.T=this.P=!1,this.h=new Eb}function Eb(){this.i=null,this.g="",this.h=!1}r(Db,kb),Db.prototype.g=function(){return new XMLHttpRequest},Db.prototype.i=function(){return{}},ie=new Db;var ae={},ce={};function Hb(e,i,s){e.L=1,e.v=Ib(N(i)),e.m=s,e.P=!0,Jb(e,null)}function Jb(e,i){e.F=Date.now(),Kb(e),e.A=N(e.v);var s=e.A,o=e.R;Array.isArray(o)||(o=[String(o)]),Lb(s.i,"t",o),e.C=0,s=e.j.J,e.h=new Eb,e.g=Mb(e.j,s?i:null,!e.m),0<e.O&&(e.M=new eb(p(e.Y,e,e.g),e.O)),i=e.U,s=e.g,o=e.ca;var l="readystatechange";Array.isArray(l)||(l&&(q[0]=l.toString()),l=q);for(var h=0;h<l.length;h++){var d=Qa(s,l[h],o||i.handleEvent,!1,i.h||i);if(!d)break;i.g[d.key]=d}i=e.H?sa(e.H):{},e.m?(e.u||(e.u="POST"),i["Content-Type"]="application/x-www-form-urlencoded",e.g.ea(e.A,e.u,e.m,i)):(e.u="GET",e.g.ea(e.A,e.u,null,i)),J(),function(e,i,s,o,l,h){e.info(function(){if(e.g)if(h)for(var d="",_=h.split("&"),f=0;f<_.length;f++){var g=_[f].split("=");if(1<g.length){var v=g[0];g=g[1];var w=v.split("_");d=2<=w.length&&"type"==w[1]?d+(v+"=")+g+"&":d+(v+"=redacted&")}}else d=null;else d=h;return"XMLHTTP REQ ("+o+") [attempt "+l+"]: "+i+"\n"+s+"\n"+d})}(e.i,e.u,e.A,e.l,e.R,e.m)}function Pb(e){return!!e.g&&("GET"==e.u&&2!=e.L&&e.j.Ca)}function Sb(e,i){var s=e.C,o=i.indexOf("\n",s);return-1==o?ce:(s=Number(i.substring(s,o)),isNaN(s)?ae:(o+=1)+s>i.length?ce:(i=i.slice(o,o+s),e.C=o+s,i))}function Kb(e){e.S=Date.now()+e.I,Wb(e,e.I)}function Wb(e,i){if(null!=e.B)throw Error("WatchDog timer not null");e.B=ub(p(e.ba,e),i)}function Ob(e){e.B&&(l.clearTimeout(e.B),e.B=null)}function Qb(e){0==e.j.G||e.J||Ub(e.j,e)}function Q(e){Ob(e);var i=e.M;i&&"function"==typeof i.ma&&i.ma(),e.M=null,gb(e.U),e.g&&(i=e.g,e.g=null,i.abort(),i.ma())}function Rb(e,i){try{var s=e.j;if(0!=s.G&&(s.g==e||Xb(s.h,e)))if(!e.K&&Xb(s.h,e)&&3==s.G){try{var o=s.Da.g.parse(i)}catch(g){o=null}if(Array.isArray(o)&&3==o.length){var l=o;if(0==l[0]){e:if(!s.u){if(s.g){if(!(s.g.F+3e3<e.F))break e;Yb(s),Zb(s)}$b(s),K(18)}}else s.za=l[1],0<s.za-s.T&&37500>l[2]&&s.F&&0==s.v&&!s.C&&(s.C=ub(p(s.Za,s),6e3));if(1>=ac(s.h)&&s.ca){try{s.ca()}catch(g){}s.ca=void 0}}else R(s,11)}else if((e.K||s.g==e)&&Yb(s),!t(i))for(l=s.Da.g.parse(i),i=0;i<l.length;i++){let g=l[i];if(s.T=g[0],g=g[1],2==s.G)if("c"==g[0]){s.K=g[1],s.ia=g[2];const i=g[3];null!=i&&(s.la=i,s.j.info("VER="+s.la));const l=g[4];null!=l&&(s.Aa=l,s.j.info("SVER="+s.Aa));const v=g[5];null!=v&&"number"==typeof v&&0<v&&(o=1.5*v,s.L=o,s.j.info("backChannelRequestTimeoutMs_="+o)),o=s;const w=e.g;if(w){const e=w.g?w.g.getResponseHeader("X-Client-Wire-Protocol"):null;if(e){var h=o.h;h.g||-1==e.indexOf("spdy")&&-1==e.indexOf("quic")&&-1==e.indexOf("h2")||(h.j=h.l,h.g=new Set,h.h&&(bc(h,h.h),h.h=null))}if(o.D){const e=w.g?w.g.getResponseHeader("X-HTTP-Session-Id"):null;e&&(o.ya=e,S2(o.I,o.D,e))}}s.G=3,s.l&&s.l.ua(),s.ba&&(s.R=Date.now()-e.F,s.j.info("Handshake RTT: "+s.R+"ms"));var d=e;if((o=s).qa=cc(o,o.J?o.ia:null,o.W),d.K){dc(o.h,d);var _=d,f=o.L;f&&(_.I=f),_.B&&(Ob(_),Kb(_)),o.g=d}else ec(o);0<s.i.length&&fc(s)}else"stop"!=g[0]&&"close"!=g[0]||R(s,7);else 3==s.G&&("stop"==g[0]||"close"==g[0]?"stop"==g[0]?R(s,7):gc(s):"noop"!=g[0]&&s.l&&s.l.ta(g),s.v=0)}J()}catch(g){}}M.prototype.ca=function(e){e=e.target;const i=this.M;i&&3==P(e)?i.j():this.Y(e)},M.prototype.Y=function(e){try{if(e==this.g)e:{const b=P(this.g);var i=this.g.Ba();this.g.Z();if(!(3>b)&&(3!=b||this.g&&(this.h.h||this.g.oa()||Nb(this.g)))){this.J||4!=b||7==i||J(),Ob(this);var s=this.g.Z();this.X=s;t:if(Pb(this)){var o=Nb(this.g);e="";var h=o.length,d=4==P(this.g);if(!this.h.i){if("undefined"==typeof TextDecoder){Q(this),Qb(this);var _="";break t}this.h.i=new l.TextDecoder}for(i=0;i<h;i++)this.h.h=!0,e+=this.h.i.decode(o[i],{stream:!(d&&i==h-1)});o.length=0,this.h.g+=e,this.C=0,_=this.h.g}else _=this.g.oa();if(this.o=200==s,function(e,i,s,o,l,h,d){e.info(function(){return"XMLHTTP RESP ("+o+") [ attempt "+l+"]: "+i+"\n"+s+"\n"+h+" "+d})}(this.i,this.u,this.A,this.l,this.R,b,s),this.o){if(this.T&&!this.K){t:{if(this.g){var f,g=this.g;if((f=g.g?g.g.getResponseHeader("X-HTTP-Initial-Response"):null)&&!t(f)){var v=f;break t}}v=null}if(!(s=v)){this.o=!1,this.s=3,K(12),Q(this),Qb(this);break e}L(this.i,this.l,s,"Initial handshake response via X-HTTP-Initial-Response"),this.K=!0,Rb(this,s)}if(this.P){let e;for(s=!0;!this.J&&this.C<_.length;){if(e=Sb(this,_),e==ce){4==b&&(this.s=4,K(14),s=!1),L(this.i,this.l,null,"[Incomplete Response]");break}if(e==ae){this.s=4,K(15),L(this.i,this.l,_,"[Invalid Chunk]"),s=!1;break}L(this.i,this.l,e,null),Rb(this,e)}if(Pb(this)&&0!=this.C&&(this.h.g=this.h.g.slice(this.C),this.C=0),4!=b||0!=_.length||this.h.h||(this.s=1,K(16),s=!1),this.o=this.o&&s,s){if(0<_.length&&!this.W){this.W=!0;var w=this.j;w.g==this&&w.ba&&!w.M&&(w.j.info("Great, no buffering proxy detected. Bytes received: "+_.length),Tb(w),w.M=!0,K(11))}}else L(this.i,this.l,_,"[Invalid Chunked Response]"),Q(this),Qb(this)}else L(this.i,this.l,_,null),Rb(this,_);4==b&&Q(this),this.o&&!this.J&&(4==b?Ub(this.j,this):(this.o=!1,Kb(this)))}else(function(e){const i={};e=(e.g&&2<=P(e)&&e.g.getAllResponseHeaders()||"").split("\r\n");for(let o=0;o<e.length;o++){if(t(e[o]))continue;var s=va(e[o]);const l=s[0];if("string"!=typeof(s=s[1]))continue;s=s.trim();const h=i[l]||[];i[l]=h,h.push(s)}!function(e,i){for(const s in e)i.call(void 0,e[s],s,e)}(i,function(e){return e.join(", ")})})(this.g),400==s&&0<_.indexOf("Unknown SID")?(this.s=3,K(12)):(this.s=0,K(13)),Q(this),Qb(this)}}}catch(b){}},M.prototype.cancel=function(){this.J=!0,Q(this)},M.prototype.ba=function(){this.B=null;const e=Date.now();0<=e-this.S?(function(e,i){e.info(function(){return"TIMEOUT: "+i})}(this.i,this.A),2!=this.L&&(J(),K(17)),Q(this),this.s=2,Qb(this)):Wb(this,this.S-e)};var ue=class{constructor(e,i){this.g=e,this.map=i}};function ic(e){this.l=e||10,l.PerformanceNavigationTiming?e=0<(e=l.performance.getEntriesByType("navigation")).length&&("hq"==e[0].nextHopProtocol||"h2"==e[0].nextHopProtocol):e=!!(l.chrome&&l.chrome.loadTimes&&l.chrome.loadTimes()&&l.chrome.loadTimes().wasFetchedViaSpdy),this.j=e?this.l:1,this.g=null,1<this.j&&(this.g=new Set),this.h=null,this.i=[]}function jc(e){return!!e.h||!!e.g&&e.g.size>=e.j}function ac(e){return e.h?1:e.g?e.g.size:0}function Xb(e,i){return e.h?e.h==i:!!e.g&&e.g.has(i)}function bc(e,i){e.g?e.g.add(i):e.h=i}function dc(e,i){e.h&&e.h==i?e.h=null:e.g&&e.g.has(i)&&e.g.delete(i)}function kc(e){if(null!=e.h)return e.i.concat(e.h.D);if(null!=e.g&&0!==e.g.size){let i=e.i;for(const s of e.g.values())i=i.concat(s.D);return i}return la(e.i)}function nc(e,i){if(e.forEach&&"function"==typeof e.forEach)e.forEach(i,void 0);else if(ha(e)||"string"==typeof e)Array.prototype.forEach.call(e,i,void 0);else for(var s=function(e){if(e.na&&"function"==typeof e.na)return e.na();if(!e.V||"function"!=typeof e.V){if("undefined"!=typeof Map&&e instanceof Map)return Array.from(e.keys());if(!("undefined"!=typeof Set&&e instanceof Set)){if(ha(e)||"string"==typeof e){var i=[];e=e.length;for(var s=0;s<e;s++)i.push(s);return i}i=[],s=0;for(const o in e)i[s++]=o;return i}}}(e),o=function(e){if(e.V&&"function"==typeof e.V)return e.V();if("undefined"!=typeof Map&&e instanceof Map||"undefined"!=typeof Set&&e instanceof Set)return Array.from(e.values());if("string"==typeof e)return e.split("");if(ha(e)){for(var i=[],s=e.length,o=0;o<s;o++)i.push(e[o]);return i}for(o in i=[],s=0,e)i[s++]=e[o];return i}(e),l=o.length,h=0;h<l;h++)i.call(void 0,o[h],s&&s[h],e)}ic.prototype.cancel=function(){if(this.i=kc(this),this.h)this.h.cancel(),this.h=null;else if(this.g&&0!==this.g.size){for(const e of this.g.values())e.cancel();this.g.clear()}};var le=RegExp("^(?:([^:/?#.]+):)?(?://(?:([^\\\\/?#]*)@)?([^\\\\/?#]*?)(?::([0-9]+))?(?=[\\\\/?#]|$))?([^?#]+)?(?:\\?([^#]*))?(?:#([\\s\\S]*))?$");function T(e){if(this.g=this.o=this.j="",this.s=null,this.m=this.l="",this.h=!1,e instanceof T){this.h=e.h,qc(this,e.j),this.o=e.o,this.g=e.g,rc(this,e.s),this.l=e.l;var i=e.i,s=new sc;s.i=i.i,i.g&&(s.g=new Map(i.g),s.h=i.h),tc(this,s),this.m=e.m}else e&&(i=String(e).match(le))?(this.h=!1,qc(this,i[1]||"",!0),this.o=uc(i[2]||""),this.g=uc(i[3]||"",!0),rc(this,i[4]),this.l=uc(i[5]||"",!0),tc(this,i[6]||"",!0),this.m=uc(i[7]||"")):(this.h=!1,this.i=new sc(null,this.h))}function N(e){return new T(e)}function qc(e,i,s){e.j=s?uc(i,!0):i,e.j&&(e.j=e.j.replace(/:$/,""))}function rc(e,i){if(i){if(i=Number(i),isNaN(i)||0>i)throw Error("Bad port number "+i);e.s=i}else e.s=null}function tc(e,i,s){i instanceof sc?(e.i=i,function(e,i){i&&!e.j&&(U(e),e.i=null,e.g.forEach(function(e,i){var s=i.toLowerCase();i!=s&&(Dc(this,i),Lb(this,s,e))},e)),e.j=i}(e.i,e.h)):(s||(i=vc(i,fe)),e.i=new sc(i,e.h))}function S2(e,i,s){e.i.set(i,s)}function Ib(e){return S2(e,"zx",Math.floor(2147483648*Math.random()).toString(36)+Math.abs(Math.floor(2147483648*Math.random())^Date.now()).toString(36)),e}function uc(e,i){return e?i?decodeURI(e.replace(/%25/g,"%2525")):decodeURIComponent(e):""}function vc(e,i,s){return"string"==typeof e?(e=encodeURI(e).replace(i,Cc),s&&(e=e.replace(/%25([0-9a-fA-F]{2})/g,"%$1")),e):null}function Cc(e){return"%"+((e=e.charCodeAt(0))>>4&15).toString(16)+(15&e).toString(16)}T.prototype.toString=function(){var e=[],i=this.j;i&&e.push(vc(i,de,!0),":");var s=this.g;return(s||"file"==i)&&(e.push("//"),(i=this.o)&&e.push(vc(i,de,!0),"@"),e.push(encodeURIComponent(String(s)).replace(/%25([0-9a-fA-F]{2})/g,"%$1")),null!=(s=this.s)&&e.push(":",String(s))),(s=this.l)&&(this.g&&"/"!=s.charAt(0)&&e.push("/"),e.push(vc(s,"/"==s.charAt(0)?pe:_e,!0))),(s=this.i.toString())&&e.push("?",s),(s=this.m)&&e.push("#",vc(s,me)),e.join("")};var he,de=/[#\/\?@]/g,_e=/[#\?:]/g,pe=/[#\?]/g,fe=/[#\?@]/g,me=/#/g;function sc(e,i){this.h=this.g=null,this.i=e||null,this.j=!!i}function U(e){e.g||(e.g=new Map,e.h=0,e.i&&function(e,i){if(e){e=e.split("&");for(var s=0;s<e.length;s++){var o=e[s].indexOf("="),l=null;if(0<=o){var h=e[s].substring(0,o);l=e[s].substring(o+1)}else h=e[s];i(h,l?decodeURIComponent(l.replace(/\+/g," ")):"")}}}(e.i,function(i,s){e.add(decodeURIComponent(i.replace(/\+/g," ")),s)}))}function Dc(e,i){U(e),i=V(e,i),e.g.has(i)&&(e.i=null,e.h-=e.g.get(i).length,e.g.delete(i))}function Ec(e,i){return U(e),i=V(e,i),e.g.has(i)}function Lb(e,i,s){Dc(e,i),0<s.length&&(e.i=null,e.g.set(V(e,i),la(s)),e.h+=s.length)}function V(e,i){return i=String(i),e.j&&(i=i.toLowerCase()),i}function W(e,i,s,o,l){try{l&&(l.onload=null,l.onerror=null,l.onabort=null,l.ontimeout=null),o(s)}catch(h){}}function Hc(){this.g=new ee}function Ic(e,i,s){const o=s||"";try{nc(e,function(e,s){let l=e;n(e)&&(l=j(e)),i.push(o+s+"="+encodeURIComponent(l))})}catch(l){throw i.push(o+"type="+encodeURIComponent("_badmap")),l}}function Jc(e){this.l=e.Ub||null,this.j=e.eb||!1}function Kc(e,i){E.call(this),this.D=e,this.o=i,this.m=void 0,this.status=this.readyState=0,this.responseType=this.responseText=this.response=this.statusText="",this.onreadystatechange=null,this.u=new Headers,this.h=null,this.B="GET",this.A="",this.g=!1,this.v=this.j=this.l=null}function Nc(e){e.j.read().then(e.Pa.bind(e)).catch(e.ga.bind(e))}function Mc(e){e.readyState=4,e.l=null,e.j=null,e.v=null,Lc(e)}function Lc(e){e.onreadystatechange&&e.onreadystatechange.call(e)}function Oc(e){let i="";return qa(e,function(e,s){i+=s,i+=":",i+=e,i+="\r\n"}),i}function Pc(e,i,s){e:{for(o in s){var o=!1;break e}o=!0}o||(s=Oc(s),"string"==typeof e?null!=s&&encodeURIComponent(String(s)):S2(e,i,s))}function X(e){E.call(this),this.headers=new Map,this.o=e||null,this.h=!1,this.v=this.g=null,this.D="",this.m=0,this.l="",this.j=this.B=this.u=this.A=!1,this.I=null,this.H="",this.J=!1}(e=sc.prototype).add=function(e,i){U(this),this.i=null,e=V(this,e);var s=this.g.get(e);return s||this.g.set(e,s=[]),s.push(i),this.h+=1,this},e.forEach=function(e,i){U(this),this.g.forEach(function(s,o){s.forEach(function(s){e.call(i,s,o,this)},this)},this)},e.na=function(){U(this);const e=Array.from(this.g.values()),i=Array.from(this.g.keys()),s=[];for(let o=0;o<i.length;o++){const l=e[o];for(let e=0;e<l.length;e++)s.push(i[o])}return s},e.V=function(e){U(this);let i=[];if("string"==typeof e)Ec(this,e)&&(i=i.concat(this.g.get(V(this,e))));else{e=Array.from(this.g.values());for(let s=0;s<e.length;s++)i=i.concat(e[s])}return i},e.set=function(e,i){return U(this),this.i=null,Ec(this,e=V(this,e))&&(this.h-=this.g.get(e).length),this.g.set(e,[i]),this.h+=1,this},e.get=function(e,i){return e&&0<(e=this.V(e)).length?String(e[0]):i},e.toString=function(){if(this.i)return this.i;if(!this.g)return"";const e=[],i=Array.from(this.g.keys());for(var s=0;s<i.length;s++){var o=i[s];const h=encodeURIComponent(String(o)),d=this.V(o);for(o=0;o<d.length;o++){var l=h;""!==d[o]&&(l+="="+encodeURIComponent(String(d[o]))),e.push(l)}}return this.i=e.join("&")},r(Jc,kb),Jc.prototype.g=function(){return new Kc(this.l,this.j)},Jc.prototype.i=(he={},function(){return he}),r(Kc,E),(e=Kc.prototype).open=function(e,i){if(0!=this.readyState)throw this.abort(),Error("Error reopening a connection");this.B=e,this.A=i,this.readyState=1,Lc(this)},e.send=function(e){if(1!=this.readyState)throw this.abort(),Error("need to call open() first. ");this.g=!0;const i={headers:this.u,method:this.B,credentials:this.m,cache:void 0};e&&(i.body=e),(this.D||l).fetch(new Request(this.A,i)).then(this.Sa.bind(this),this.ga.bind(this))},e.abort=function(){this.response=this.responseText="",this.u=new Headers,this.status=0,this.j&&this.j.cancel("Request was aborted.").catch(()=>{}),1<=this.readyState&&this.g&&4!=this.readyState&&(this.g=!1,Mc(this)),this.readyState=0},e.Sa=function(e){if(this.g&&(this.l=e,this.h||(this.status=this.l.status,this.statusText=this.l.statusText,this.h=e.headers,this.readyState=2,Lc(this)),this.g&&(this.readyState=3,Lc(this),this.g)))if("arraybuffer"===this.responseType)e.arrayBuffer().then(this.Qa.bind(this),this.ga.bind(this));else if(void 0!==l.ReadableStream&&"body"in e){if(this.j=e.body.getReader(),this.o){if(this.responseType)throw Error('responseType must be empty for "streamBinaryChunks" mode responses.');this.response=[]}else this.response=this.responseText="",this.v=new TextDecoder;Nc(this)}else e.text().then(this.Ra.bind(this),this.ga.bind(this))},e.Pa=function(e){if(this.g){if(this.o&&e.value)this.response.push(e.value);else if(!this.o){var i=e.value?e.value:new Uint8Array(0);(i=this.v.decode(i,{stream:!e.done}))&&(this.response=this.responseText+=i)}e.done?Mc(this):Lc(this),3==this.readyState&&Nc(this)}},e.Ra=function(e){this.g&&(this.response=this.responseText=e,Mc(this))},e.Qa=function(e){this.g&&(this.response=e,Mc(this))},e.ga=function(){this.g&&Mc(this)},e.setRequestHeader=function(e,i){this.u.append(e,i)},e.getResponseHeader=function(e){return this.h&&this.h.get(e.toLowerCase())||""},e.getAllResponseHeaders=function(){if(!this.h)return"";const e=[],i=this.h.entries();for(var s=i.next();!s.done;)s=s.value,e.push(s[0]+": "+s[1]),s=i.next();return e.join("\r\n")},Object.defineProperty(Kc.prototype,"withCredentials",{get:function(){return"include"===this.m},set:function(e){this.m=e?"include":"same-origin"}}),r(X,E);var ge=/^https?$/i,Ee=["POST","PUT"];function Sc(e,i){e.h=!1,e.g&&(e.j=!0,e.g.abort(),e.j=!1),e.l=i,e.m=5,Uc(e),Vc(e)}function Uc(e){e.A||(e.A=!0,F(e,"complete"),F(e,"error"))}function Wc(e){if(e.h&&void 0!==o&&(!e.v[1]||4!=P(e)||2!=e.Z()))if(e.u&&4==P(e))bb(e.Ea,0,e);else if(F(e,"readystatechange"),4==P(e)){e.h=!1;try{const o=e.Z();e:switch(o){case 200:case 201:case 202:case 204:case 206:case 304:case 1223:var i=!0;break e;default:i=!1}var s;if(!(s=i)){var h;if(h=0===o){var d=String(e.D).match(le)[1]||null;!d&&l.self&&l.self.location&&(d=l.self.location.protocol.slice(0,-1)),h=!ge.test(d?d.toLowerCase():"")}s=h}if(s)F(e,"complete"),F(e,"success");else{e.m=6;try{var _=2<P(e)?e.g.statusText:""}catch(f){_=""}e.l=_+" ["+e.Z()+"]",Uc(e)}}finally{Vc(e)}}}function Vc(e,i){if(e.g){Tc(e);const o=e.g,l=e.v[0]?()=>{}:null;e.g=null,e.v=null,i||F(e,"ready");try{o.onreadystatechange=l}catch(s){}}}function Tc(e){e.I&&(l.clearTimeout(e.I),e.I=null)}function P(e){return e.g?e.g.readyState:0}function Nb(e){try{if(!e.g)return null;if("response"in e.g)return e.g.response;switch(e.H){case"":case"text":return e.g.responseText;case"arraybuffer":if("mozResponseArrayBuffer"in e.g)return e.g.mozResponseArrayBuffer}return null}catch(i){return null}}function Xc(e,i,s){return s&&s.internalChannelParams&&s.internalChannelParams[e]||i}function Yc(e){this.Aa=0,this.i=[],this.j=new vb,this.ia=this.qa=this.I=this.W=this.g=this.ya=this.D=this.H=this.m=this.S=this.o=null,this.Ya=this.U=0,this.Va=Xc("failFast",!1,e),this.F=this.C=this.u=this.s=this.l=null,this.X=!0,this.za=this.T=-1,this.Y=this.v=this.B=0,this.Ta=Xc("baseRetryDelayMs",5e3,e),this.cb=Xc("retryDelaySeedMs",1e4,e),this.Wa=Xc("forwardChannelMaxRetries",2,e),this.wa=Xc("forwardChannelRequestTimeoutMs",2e4,e),this.pa=e&&e.xmlHttpFactory||void 0,this.Xa=e&&e.Tb||void 0,this.Ca=e&&e.useFetchStreams||!1,this.L=void 0,this.J=e&&e.supportsCrossDomainXhr||!1,this.K="",this.h=new ic(e&&e.concurrentRequestLimit),this.Da=new Hc,this.P=e&&e.fastHandshake||!1,this.O=e&&e.encodeInitMessageHeaders||!1,this.P&&this.O&&(this.O=!1),this.Ua=e&&e.Rb||!1,e&&e.xa&&this.j.xa(),e&&e.forceLongPolling&&(this.X=!1),this.ba=!this.P&&this.X&&e&&e.detectBufferingProxy||!1,this.ja=void 0,e&&e.longPollingTimeout&&0<e.longPollingTimeout&&(this.ja=e.longPollingTimeout),this.ca=void 0,this.R=0,this.M=!1,this.ka=this.A=null}function gc(e){if(Zc(e),3==e.G){var i=e.U++,s=N(e.I);if(S2(s,"SID",e.K),S2(s,"RID",i),S2(s,"TYPE","terminate"),$c(e,s),(i=new M(e,e.j,i)).L=2,i.v=Ib(N(s)),s=!1,l.navigator&&l.navigator.sendBeacon)try{s=l.navigator.sendBeacon(i.v.toString(),"")}catch(o){}!s&&l.Image&&((new Image).src=i.v,s=!0),s||(i.g=Mb(i.j,null),i.g.ea(i.v)),i.F=Date.now(),Kb(i)}ad(e)}function Zb(e){e.g&&(Tb(e),e.g.cancel(),e.g=null)}function Zc(e){Zb(e),e.u&&(l.clearTimeout(e.u),e.u=null),Yb(e),e.h.cancel(),e.s&&("number"==typeof e.s&&l.clearTimeout(e.s),e.s=null)}function fc(e){if(!jc(e.h)&&!e.s){e.s=!0;var i=e.Ga;f||Ea(),g||(f(),g=!0),v.add(i,e),e.B=0}}function ed(e,i){var s;s=i?i.l:e.U++;const o=N(e.I);S2(o,"SID",e.K),S2(o,"RID",s),S2(o,"AID",e.T),$c(e,o),e.m&&e.o&&Pc(o,e.m,e.o),s=new M(e,e.j,s,e.B+1),null===e.m&&(s.H=e.o),i&&(e.i=i.D.concat(e.i)),i=dd(e,s,1e3),s.I=Math.round(.5*e.wa)+Math.round(.5*e.wa*Math.random()),bc(e.h,s),Hb(s,o,i)}function $c(e,i){e.H&&qa(e.H,function(e,s){S2(i,s,e)}),e.l&&nc({},function(e,s){S2(i,s,e)})}function dd(e,i,s){s=Math.min(e.i.length,s);var o=e.l?p(e.l.Na,e.l,e):null;e:{var l=e.i;let i=-1;for(;;){const e=["count="+s];-1==i?0<s?(i=l[0].g,e.push("ofs="+i)):i=0:e.push("ofs="+i);let d=!0;for(let _=0;_<s;_++){let s=l[_].g;const f=l[_].map;if(s-=i,0>s)i=Math.max(0,l[_].g-100),d=!1;else try{Ic(f,e,"req"+s+"_")}catch(h){o&&o(f)}}if(d){o=e.join("&");break e}}}return e=e.i.splice(0,s),i.D=e,o}function ec(e){if(!e.g&&!e.u){e.Y=1;var i=e.Fa;f||Ea(),g||(f(),g=!0),v.add(i,e),e.v=0}}function $b(e){return!(e.g||e.u||3<=e.v)&&(e.Y++,e.u=ub(p(e.Fa,e),cd(e,e.v)),e.v++,!0)}function Tb(e){null!=e.A&&(l.clearTimeout(e.A),e.A=null)}function fd(e){e.g=new M(e,e.j,"rpc",e.Y),null===e.m&&(e.g.H=e.o),e.g.O=0;var i=N(e.qa);S2(i,"RID","rpc"),S2(i,"SID",e.K),S2(i,"AID",e.T),S2(i,"CI",e.F?"0":"1"),!e.F&&e.ja&&S2(i,"TO",e.ja),S2(i,"TYPE","xmlhttp"),$c(e,i),e.m&&e.o&&Pc(i,e.m,e.o),e.L&&(e.g.I=e.L);var s=e.g;e=e.ia,s.L=1,s.v=Ib(N(i)),s.m=null,s.P=!0,Jb(s,e)}function Yb(e){null!=e.C&&(l.clearTimeout(e.C),e.C=null)}function Ub(e,i){var s=null;if(e.g==i){Yb(e),Tb(e),e.g=null;var o=2}else{if(!Xb(e.h,i))return;s=i.D,dc(e.h,i),o=1}if(0!=e.G)if(i.o)if(1==o){s=i.m?i.m.length:0,i=Date.now()-i.F;var l=e.B;F(o=qb(),new tb(o,s)),fc(e)}else ec(e);else if(3==(l=i.s)||0==l&&0<i.X||!(1==o&&function(e,i){return!(ac(e.h)>=e.h.j-(e.s?1:0)||(e.s?(e.i=i.D.concat(e.i),0):1==e.G||2==e.G||e.B>=(e.Va?0:e.Wa)||(e.s=ub(p(e.Ga,e,i),cd(e,e.B)),e.B++,0)))}(e,i)||2==o&&$b(e)))switch(s&&0<s.length&&(i=e.h,i.i=i.i.concat(s)),l){case 1:R(e,5);break;case 4:R(e,10);break;case 3:R(e,6);break;default:R(e,2)}}function cd(e,i){let s=e.Ta+Math.floor(Math.random()*e.cb);return e.isActive()||(s*=2),s*i}function R(e,i){if(e.j.info("Error code "+i),2==i){var s=p(e.fb,e),o=e.Xa;const i=!o;o=new T(o||"//www.google.com/images/cleardot.gif"),l.location&&"http"==l.location.protocol||qc(o,"https"),Ib(o),i?function(e,i){const s=new vb;if(l.Image){const o=new Image;o.onload=ka(W,s,"TestLoadImage: loaded",!0,i,o),o.onerror=ka(W,s,"TestLoadImage: error",!1,i,o),o.onabort=ka(W,s,"TestLoadImage: abort",!1,i,o),o.ontimeout=ka(W,s,"TestLoadImage: timeout",!1,i,o),l.setTimeout(function(){o.ontimeout&&o.ontimeout()},1e4),o.src=e}else i(!1)}(o.toString(),s):function(e,i){new vb;const s=new AbortController,o=setTimeout(()=>{s.abort(),W(0,0,!1,i)},1e4);fetch(e,{signal:s.signal}).then(e=>{clearTimeout(o),e.ok?W(0,0,!0,i):W(0,0,!1,i)}).catch(()=>{clearTimeout(o),W(0,0,!1,i)})}(o.toString(),s)}else K(2);e.G=0,e.l&&e.l.sa(i),ad(e),Zc(e)}function ad(e){if(e.G=0,e.ka=[],e.l){const i=kc(e.h);0==i.length&&0==e.i.length||(ma(e.ka,i),ma(e.ka,e.i),e.h.i.length=0,la(e.i),e.i.length=0),e.l.ra()}}function cc(e,i,s){var o=s instanceof T?N(s):new T(s);if(""!=o.g)i&&(o.g=i+"."+o.g),rc(o,o.s);else{var h=l.location;o=h.protocol,i=i?i+"."+h.hostname:h.hostname,h=+h.port;var d=new T(null);o&&qc(d,o),i&&(d.g=i),h&&rc(d,h),s&&(d.l=s),o=d}return s=e.D,i=e.ya,s&&i&&S2(o,s,i),S2(o,"VER",e.la),$c(e,o),o}function Mb(e,i,s){if(i&&!e.J)throw Error("Can't create secondary domain capable XhrIo object.");return(i=e.Ca&&!e.pa?new X(new Jc({eb:s})):new X(e.pa)).Ha(e.J),i}function gd(){}function hd(){}function Y(e,i){E.call(this),this.g=new Yc(i),this.l=e,this.h=i&&i.messageUrlParams||null,e=i&&i.messageHeaders||null,i&&i.clientProtocolHeaderRequired&&(e?e["X-Client-Protocol"]="webchannel":e={"X-Client-Protocol":"webchannel"}),this.g.o=e,e=i&&i.initMessageHeaders||null,i&&i.messageContentType&&(e?e["X-WebChannel-Content-Type"]=i.messageContentType:e={"X-WebChannel-Content-Type":i.messageContentType}),i&&i.va&&(e?e["X-WebChannel-Client-Profile"]=i.va:e={"X-WebChannel-Client-Profile":i.va}),this.g.S=e,(e=i&&i.Sb)&&!t(e)&&(this.g.m=e),this.v=i&&i.supportsCrossDomainXhr||!1,this.u=i&&i.sendRawJson||!1,(i=i&&i.httpSessionIdParam)&&!t(i)&&(this.g.D=i,null!==(e=this.h)&&i in e&&(i in(e=this.h)&&delete e[i])),this.j=new Z(this)}function id(e){nb.call(this),e.__headers__&&(this.headers=e.__headers__,this.statusCode=e.__status__,delete e.__headers__,delete e.__status__);var i=e.__sm__;if(i){e:{for(const s in i){e=s;break e}e=void 0}(this.i=e)&&(e=this.i,i=null!==i&&e in i?i[e]:void 0),this.data=i}else this.data=e}function jd(){ob.call(this),this.status=1}function Z(e){this.g=e}(e=X.prototype).Ha=function(e){this.J=e},e.ea=function(e,i,s,o){if(this.g)throw Error("[goog.net.XhrIo] Object is active with another request="+this.D+"; newUri="+e);i=i?i.toUpperCase():"GET",this.D=e,this.l="",this.m=0,this.A=!1,this.h=!0,this.g=this.o?this.o.g():ie.g(),this.v=this.o?lb(this.o):lb(ie),this.g.onreadystatechange=p(this.Ea,this);try{this.B=!0,this.g.open(i,String(e),!0),this.B=!1}catch(d){return void Sc(this,d)}if(e=s||"",s=new Map(this.headers),o)if(Object.getPrototypeOf(o)===Object.prototype)for(var h in o)s.set(h,o[h]);else{if("function"!=typeof o.keys||"function"!=typeof o.get)throw Error("Unknown input type for opt_headers: "+String(o));for(const e of o.keys())s.set(e,o.get(e))}o=Array.from(s.keys()).find(e=>"content-type"==e.toLowerCase()),h=l.FormData&&e instanceof l.FormData,!(0<=Array.prototype.indexOf.call(Ee,i,void 0))||o||h||s.set("Content-Type","application/x-www-form-urlencoded;charset=utf-8");for(const[l,_]of s)this.g.setRequestHeader(l,_);this.H&&(this.g.responseType=this.H),"withCredentials"in this.g&&this.g.withCredentials!==this.J&&(this.g.withCredentials=this.J);try{Tc(this),this.u=!0,this.g.send(e),this.u=!1}catch(d){Sc(this,d)}},e.abort=function(e){this.g&&this.h&&(this.h=!1,this.j=!0,this.g.abort(),this.j=!1,this.m=e||7,F(this,"complete"),F(this,"abort"),Vc(this))},e.N=function(){this.g&&(this.h&&(this.h=!1,this.j=!0,this.g.abort(),this.j=!1),Vc(this,!0)),X.aa.N.call(this)},e.Ea=function(){this.s||(this.B||this.u||this.j?Wc(this):this.bb())},e.bb=function(){Wc(this)},e.isActive=function(){return!!this.g},e.Z=function(){try{return 2<P(this)?this.g.status:-1}catch(he){return-1}},e.oa=function(){try{return this.g?this.g.responseText:""}catch(he){return""}},e.Oa=function(e){if(this.g){var i=this.g.responseText;return e&&0==i.indexOf(e)&&(i=i.substring(e.length)),$(i)}},e.Ba=function(){return this.m},e.Ka=function(){return"string"==typeof this.l?this.l:String(this.l)},(e=Yc.prototype).la=8,e.G=1,e.connect=function(e,i,s,o){K(0),this.W=e,this.H=i||{},s&&void 0!==o&&(this.H.OSID=s,this.H.OAID=o),this.F=this.X,this.I=cc(this,null,this.W),fc(this)},e.Ga=function(e){if(this.s)if(this.s=null,1==this.G){if(!e){this.U=Math.floor(1e5*Math.random()),e=this.U++;const l=new M(this,this.j,e);let h=this.o;if(this.S&&(h?(h=sa(h),ua(h,this.S)):h=this.S),null!==this.m||this.O||(l.H=h,h=null),this.P)e:{for(var i=0,s=0;s<this.i.length;s++){var o=this.i[s];if(void 0===(o="__data__"in o.map&&"string"==typeof(o=o.map.__data__)?o.length:void 0))break;if(4096<(i+=o)){i=s;break e}if(4096===i||s===this.i.length-1){i=s+1;break e}}i=1e3}else i=1e3;i=dd(this,l,i),S2(s=N(this.I),"RID",e),S2(s,"CVER",22),this.D&&S2(s,"X-HTTP-Session-Id",this.D),$c(this,s),h&&(this.O?i="headers="+encodeURIComponent(String(Oc(h)))+"&"+i:this.m&&Pc(s,this.m,h)),bc(this.h,l),this.Ua&&S2(s,"TYPE","init"),this.P?(S2(s,"$req",i),S2(s,"SID","null"),l.T=!0,Hb(l,s,null)):Hb(l,s,i),this.G=2}}else 3==this.G&&(e?ed(this,e):0==this.i.length||jc(this.h)||ed(this))},e.Fa=function(){if(this.u=null,fd(this),this.ba&&!(this.M||null==this.g||0>=this.R)){var e=2*this.R;this.j.info("BP detection timer enabled: "+e),this.A=ub(p(this.ab,this),e)}},e.ab=function(){this.A&&(this.A=null,this.j.info("BP detection timeout reached."),this.j.info("Buffering proxy detected and switch to long-polling!"),this.F=!1,this.M=!0,K(10),Zb(this),fd(this))},e.Za=function(){null!=this.C&&(this.C=null,Zb(this),$b(this),K(19))},e.fb=function(e){e?(this.j.info("Successfully pinged google.com"),K(2)):(this.j.info("Failed to ping google.com"),K(1))},e.isActive=function(){return!!this.l&&this.l.isActive(this)},(e=gd.prototype).ua=function(){},e.ta=function(){},e.sa=function(){},e.ra=function(){},e.isActive=function(){return!0},e.Na=function(){},hd.prototype.g=function(e,i){return new Y(e,i)},r(Y,E),Y.prototype.m=function(){this.g.l=this.j,this.v&&(this.g.J=!0),this.g.connect(this.l,this.h||void 0)},Y.prototype.close=function(){gc(this.g)},Y.prototype.o=function(e){var i=this.g;if("string"==typeof e){var s={};s.__data__=e,e=s}else this.u&&((s={}).__data__=j(e),e=s);i.i.push(new ue(i.Ya++,e)),3==i.G&&fc(i)},Y.prototype.N=function(){this.g.l=null,delete this.j,gc(this.g),delete this.g,Y.aa.N.call(this)},r(id,nb),r(jd,ob),r(Z,gd),Z.prototype.ua=function(){F(this.g,"a")},Z.prototype.ta=function(e){F(this.g,new id(e))},Z.prototype.sa=function(e){F(this.g,new jd)},Z.prototype.ra=function(){F(this.g,"b")},hd.prototype.createWebChannel=hd.prototype.g,Y.prototype.send=Y.prototype.o,Y.prototype.open=Y.prototype.m,Y.prototype.close=Y.prototype.close,bt=function(){return new hd},Vt=function(){return qb()},wt=re,Rt={mb:0,pb:1,qb:2,Jb:3,Ob:4,Lb:5,Mb:6,Kb:7,Ib:8,Nb:9,PROXY:10,NOPROXY:11,Gb:12,Cb:13,Db:14,Bb:15,Eb:16,Fb:17,ib:18,hb:19,jb:20},se.NO_ERROR=0,se.TIMEOUT=8,se.HTTP_ERROR=6,vt=se,oe.COMPLETE="complete",Pt=oe,mb.EventType=te,te.OPEN="a",te.CLOSE="b",te.ERROR="c",te.MESSAGE="d",E.prototype.listen=E.prototype.K,At=mb,X.prototype.listenOnce=X.prototype.L,X.prototype.getLastError=X.prototype.Ka,X.prototype.getLastErrorCode=X.prototype.Ba,X.prototype.getStatus=X.prototype.Z,X.prototype.getResponseJson=X.prototype.Oa,X.prototype.getResponseText=X.prototype.oa,X.prototype.send=X.prototype.ea,X.prototype.setWithCredentials=X.prototype.Ha,Tt=X}).apply(void 0!==St?St:"undefined"!=typeof self?self:"undefined"!=typeof window?window:{});const Ct="@firebase/firestore";
/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class User{constructor(e){this.uid=e}isAuthenticated(){return null!=this.uid}toKey(){return this.isAuthenticated()?"uid:"+this.uid:"anonymous-user"}isEqual(e){return e.uid===this.uid}}User.UNAUTHENTICATED=new User(null),User.GOOGLE_CREDENTIALS=new User("google-credentials-uid"),User.FIRST_PARTY=new User("first-party-uid"),User.MOCK_USER=new User("mock-user");
/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
let Dt="10.14.0";
/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const kt=new Logger("@firebase/firestore");function __PRIVATE_getLogLevel(){return kt.logLevel}function __PRIVATE_logDebug(e,...i){if(kt.logLevel<=o.DEBUG){const s=i.map(__PRIVATE_argToString);kt.debug(`Firestore (${Dt}): ${e}`,...s)}}function __PRIVATE_logError(e,...i){if(kt.logLevel<=o.ERROR){const s=i.map(__PRIVATE_argToString);kt.error(`Firestore (${Dt}): ${e}`,...s)}}function __PRIVATE_logWarn(e,...i){if(kt.logLevel<=o.WARN){const s=i.map(__PRIVATE_argToString);kt.warn(`Firestore (${Dt}): ${e}`,...s)}}function __PRIVATE_argToString(e){if("string"==typeof e)return e;try{
/**
    * @license
    * Copyright 2020 Google LLC
    *
    * Licensed under the Apache License, Version 2.0 (the "License");
    * you may not use this file except in compliance with the License.
    * You may obtain a copy of the License at
    *
    *   http://www.apache.org/licenses/LICENSE-2.0
    *
    * Unless required by applicable law or agreed to in writing, software
    * distributed under the License is distributed on an "AS IS" BASIS,
    * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
    * See the License for the specific language governing permissions and
    * limitations under the License.
    */
return i=e,JSON.stringify(i)}catch(s){return e}var i}
/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function fail(e="Unexpected state"){const i=`FIRESTORE (${Dt}) INTERNAL ASSERTION FAILED: `+e;throw __PRIVATE_logError(i),new Error(i)}function __PRIVATE_hardAssert(e,i){e||fail()}function __PRIVATE_debugCast(e,i){return e}
/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Nt={OK:"ok",CANCELLED:"cancelled",UNKNOWN:"unknown",INVALID_ARGUMENT:"invalid-argument",DEADLINE_EXCEEDED:"deadline-exceeded",NOT_FOUND:"not-found",ALREADY_EXISTS:"already-exists",PERMISSION_DENIED:"permission-denied",UNAUTHENTICATED:"unauthenticated",RESOURCE_EXHAUSTED:"resource-exhausted",FAILED_PRECONDITION:"failed-precondition",ABORTED:"aborted",OUT_OF_RANGE:"out-of-range",UNIMPLEMENTED:"unimplemented",INTERNAL:"internal",UNAVAILABLE:"unavailable",DATA_LOSS:"data-loss"};class FirestoreError extends FirebaseError{constructor(e,i){super(e,i),this.code=e,this.message=i,this.toString=()=>`${this.name}: [code=${this.code}]: ${this.message}`}}
/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class __PRIVATE_Deferred{constructor(){this.promise=new Promise((e,i)=>{this.resolve=e,this.reject=i})}}
/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class __PRIVATE_OAuthToken{constructor(e,i){this.user=i,this.type="OAuth",this.headers=new Map,this.headers.set("Authorization",`Bearer ${e}`)}}class __PRIVATE_EmptyAuthCredentialsProvider{getToken(){return Promise.resolve(null)}invalidateToken(){}start(e,i){e.enqueueRetryable(()=>i(User.UNAUTHENTICATED))}shutdown(){}}class __PRIVATE_EmulatorAuthCredentialsProvider{constructor(e){this.token=e,this.changeListener=null}getToken(){return Promise.resolve(this.token)}invalidateToken(){}start(e,i){this.changeListener=i,e.enqueueRetryable(()=>i(this.token.user))}shutdown(){this.changeListener=null}}class __PRIVATE_FirebaseAuthCredentialsProvider{constructor(e){this.t=e,this.currentUser=User.UNAUTHENTICATED,this.i=0,this.forceRefresh=!1,this.auth=null}start(e,i){__PRIVATE_hardAssert(void 0===this.o);let s=this.i;const __PRIVATE_guardedChangeListener=e=>this.i!==s?(s=this.i,i(e)):Promise.resolve();let o=new __PRIVATE_Deferred;this.o=()=>{this.i++,this.currentUser=this.u(),o.resolve(),o=new __PRIVATE_Deferred,e.enqueueRetryable(()=>__PRIVATE_guardedChangeListener(this.currentUser))};const __PRIVATE_awaitNextToken=()=>{const i=o;e.enqueueRetryable(async()=>{await i.promise,await __PRIVATE_guardedChangeListener(this.currentUser)})},__PRIVATE_registerAuth=e=>{__PRIVATE_logDebug("FirebaseAuthCredentialsProvider","Auth detected"),this.auth=e,this.o&&(this.auth.addAuthTokenListener(this.o),__PRIVATE_awaitNextToken())};this.t.onInit(e=>__PRIVATE_registerAuth(e)),setTimeout(()=>{if(!this.auth){const e=this.t.getImmediate({optional:!0});e?__PRIVATE_registerAuth(e):(__PRIVATE_logDebug("FirebaseAuthCredentialsProvider","Auth not yet detected"),o.resolve(),o=new __PRIVATE_Deferred)}},0),__PRIVATE_awaitNextToken()}getToken(){const e=this.i,i=this.forceRefresh;return this.forceRefresh=!1,this.auth?this.auth.getToken(i).then(i=>this.i!==e?(__PRIVATE_logDebug("FirebaseAuthCredentialsProvider","getToken aborted due to token change."),this.getToken()):i?(__PRIVATE_hardAssert("string"==typeof i.accessToken),new __PRIVATE_OAuthToken(i.accessToken,this.currentUser)):null):Promise.resolve(null)}invalidateToken(){this.forceRefresh=!0}shutdown(){this.auth&&this.o&&this.auth.removeAuthTokenListener(this.o),this.o=void 0}u(){const e=this.auth&&this.auth.getUid();return __PRIVATE_hardAssert(null===e||"string"==typeof e),new User(e)}}class __PRIVATE_FirstPartyToken{constructor(e,i,s){this.l=e,this.h=i,this.P=s,this.type="FirstParty",this.user=User.FIRST_PARTY,this.I=new Map}T(){return this.P?this.P():null}get headers(){this.I.set("X-Goog-AuthUser",this.l);const e=this.T();return e&&this.I.set("Authorization",e),this.h&&this.I.set("X-Goog-Iam-Authorization-Token",this.h),this.I}}class __PRIVATE_FirstPartyAuthCredentialsProvider{constructor(e,i,s){this.l=e,this.h=i,this.P=s}getToken(){return Promise.resolve(new __PRIVATE_FirstPartyToken(this.l,this.h,this.P))}start(e,i){e.enqueueRetryable(()=>i(User.FIRST_PARTY))}shutdown(){}invalidateToken(){}}class AppCheckToken{constructor(e){this.value=e,this.type="AppCheck",this.headers=new Map,e&&e.length>0&&this.headers.set("x-firebase-appcheck",this.value)}}class __PRIVATE_FirebaseAppCheckTokenProvider{constructor(e){this.A=e,this.forceRefresh=!1,this.appCheck=null,this.R=null}start(e,i){__PRIVATE_hardAssert(void 0===this.o);const onTokenChanged=e=>{null!=e.error&&__PRIVATE_logDebug("FirebaseAppCheckTokenProvider",`Error getting App Check token; using placeholder token instead. Error: ${e.error.message}`);const s=e.token!==this.R;return this.R=e.token,__PRIVATE_logDebug("FirebaseAppCheckTokenProvider",`Received ${s?"new":"existing"} token.`),s?i(e.token):Promise.resolve()};this.o=i=>{e.enqueueRetryable(()=>onTokenChanged(i))};const __PRIVATE_registerAppCheck=e=>{__PRIVATE_logDebug("FirebaseAppCheckTokenProvider","AppCheck detected"),this.appCheck=e,this.o&&this.appCheck.addTokenListener(this.o)};this.A.onInit(e=>__PRIVATE_registerAppCheck(e)),setTimeout(()=>{if(!this.appCheck){const e=this.A.getImmediate({optional:!0});e?__PRIVATE_registerAppCheck(e):__PRIVATE_logDebug("FirebaseAppCheckTokenProvider","AppCheck not yet detected")}},0)}getToken(){const e=this.forceRefresh;return this.forceRefresh=!1,this.appCheck?this.appCheck.getToken(e).then(e=>e?(__PRIVATE_hardAssert("string"==typeof e.token),this.R=e.token,new AppCheckToken(e.token)):null):Promise.resolve(null)}invalidateToken(){this.forceRefresh=!0}shutdown(){this.appCheck&&this.o&&this.appCheck.removeTokenListener(this.o),this.o=void 0}}
/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function __PRIVATE_randomBytes(e){const i="undefined"!=typeof self&&(self.crypto||self.msCrypto),s=new Uint8Array(e);if(i&&"function"==typeof i.getRandomValues)i.getRandomValues(s);else for(let o=0;o<e;o++)s[o]=Math.floor(256*Math.random());return s}
/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class __PRIVATE_AutoId{static newId(){const e="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789",i=62*Math.floor(256/62);let s="";for(;s.length<20;){const o=__PRIVATE_randomBytes(40);for(let l=0;l<o.length;++l)s.length<20&&o[l]<i&&(s+=e.charAt(o[l]%62))}return s}}function __PRIVATE_primitiveComparator(e,i){return e<i?-1:e>i?1:0}function __PRIVATE_arrayEquals(e,i,s){return e.length===i.length&&e.every((e,o)=>s(e,i[o]))}
/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Timestamp{constructor(e,i){if(this.seconds=e,this.nanoseconds=i,i<0)throw new FirestoreError(Nt.INVALID_ARGUMENT,"Timestamp nanoseconds out of range: "+i);if(i>=1e9)throw new FirestoreError(Nt.INVALID_ARGUMENT,"Timestamp nanoseconds out of range: "+i);if(e<-62135596800)throw new FirestoreError(Nt.INVALID_ARGUMENT,"Timestamp seconds out of range: "+e);if(e>=253402300800)throw new FirestoreError(Nt.INVALID_ARGUMENT,"Timestamp seconds out of range: "+e)}static now(){return Timestamp.fromMillis(Date.now())}static fromDate(e){return Timestamp.fromMillis(e.getTime())}static fromMillis(e){const i=Math.floor(e/1e3),s=Math.floor(1e6*(e-1e3*i));return new Timestamp(i,s)}toDate(){return new Date(this.toMillis())}toMillis(){return 1e3*this.seconds+this.nanoseconds/1e6}_compareTo(e){return this.seconds===e.seconds?__PRIVATE_primitiveComparator(this.nanoseconds,e.nanoseconds):__PRIVATE_primitiveComparator(this.seconds,e.seconds)}isEqual(e){return e.seconds===this.seconds&&e.nanoseconds===this.nanoseconds}toString(){return"Timestamp(seconds="+this.seconds+", nanoseconds="+this.nanoseconds+")"}toJSON(){return{seconds:this.seconds,nanoseconds:this.nanoseconds}}valueOf(){const e=this.seconds- -62135596800;return String(e).padStart(12,"0")+"."+String(this.nanoseconds).padStart(9,"0")}}
/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class SnapshotVersion{constructor(e){this.timestamp=e}static fromTimestamp(e){return new SnapshotVersion(e)}static min(){return new SnapshotVersion(new Timestamp(0,0))}static max(){return new SnapshotVersion(new Timestamp(253402300799,999999999))}compareTo(e){return this.timestamp._compareTo(e.timestamp)}isEqual(e){return this.timestamp.isEqual(e.timestamp)}toMicroseconds(){return 1e6*this.timestamp.seconds+this.timestamp.nanoseconds/1e3}toString(){return"SnapshotVersion("+this.timestamp.toString()+")"}toTimestamp(){return this.timestamp}}
/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class BasePath{constructor(e,i,s){void 0===i?i=0:i>e.length&&fail(),void 0===s?s=e.length-i:s>e.length-i&&fail(),this.segments=e,this.offset=i,this.len=s}get length(){return this.len}isEqual(e){return 0===BasePath.comparator(this,e)}child(e){const i=this.segments.slice(this.offset,this.limit());return e instanceof BasePath?e.forEach(e=>{i.push(e)}):i.push(e),this.construct(i)}limit(){return this.offset+this.length}popFirst(e){return e=void 0===e?1:e,this.construct(this.segments,this.offset+e,this.length-e)}popLast(){return this.construct(this.segments,this.offset,this.length-1)}firstSegment(){return this.segments[this.offset]}lastSegment(){return this.get(this.length-1)}get(e){return this.segments[this.offset+e]}isEmpty(){return 0===this.length}isPrefixOf(e){if(e.length<this.length)return!1;for(let i=0;i<this.length;i++)if(this.get(i)!==e.get(i))return!1;return!0}isImmediateParentOf(e){if(this.length+1!==e.length)return!1;for(let i=0;i<this.length;i++)if(this.get(i)!==e.get(i))return!1;return!0}forEach(e){for(let i=this.offset,s=this.limit();i<s;i++)e(this.segments[i])}toArray(){return this.segments.slice(this.offset,this.limit())}static comparator(e,i){const s=Math.min(e.length,i.length);for(let o=0;o<s;o++){const s=e.get(o),l=i.get(o);if(s<l)return-1;if(s>l)return 1}return e.length<i.length?-1:e.length>i.length?1:0}}class ResourcePath extends BasePath{construct(e,i,s){return new ResourcePath(e,i,s)}canonicalString(){return this.toArray().join("/")}toString(){return this.canonicalString()}toUriEncodedString(){return this.toArray().map(encodeURIComponent).join("/")}static fromString(...e){const i=[];for(const s of e){if(s.indexOf("//")>=0)throw new FirestoreError(Nt.INVALID_ARGUMENT,`Invalid segment (${s}). Paths must not contain // in them.`);i.push(...s.split("/").filter(e=>e.length>0))}return new ResourcePath(i)}static emptyPath(){return new ResourcePath([])}}const Ot=/^[_a-zA-Z][_a-zA-Z0-9]*$/;class FieldPath$1 extends BasePath{construct(e,i,s){return new FieldPath$1(e,i,s)}static isValidIdentifier(e){return Ot.test(e)}canonicalString(){return this.toArray().map(e=>(e=e.replace(/\\/g,"\\\\").replace(/`/g,"\\`"),FieldPath$1.isValidIdentifier(e)||(e="`"+e+"`"),e)).join(".")}toString(){return this.canonicalString()}isKeyField(){return 1===this.length&&"__name__"===this.get(0)}static keyField(){return new FieldPath$1(["__name__"])}static fromServerFormat(e){const i=[];let s="",o=0;const __PRIVATE_addCurrentSegment=()=>{if(0===s.length)throw new FirestoreError(Nt.INVALID_ARGUMENT,`Invalid field path (${e}). Paths must not be empty, begin with '.', end with '.', or contain '..'`);i.push(s),s=""};let l=!1;for(;o<e.length;){const i=e[o];if("\\"===i){if(o+1===e.length)throw new FirestoreError(Nt.INVALID_ARGUMENT,"Path has trailing escape character: "+e);const i=e[o+1];if("\\"!==i&&"."!==i&&"`"!==i)throw new FirestoreError(Nt.INVALID_ARGUMENT,"Path has invalid escape sequence: "+e);s+=i,o+=2}else"`"===i?(l=!l,o++):"."!==i||l?(s+=i,o++):(__PRIVATE_addCurrentSegment(),o++)}if(__PRIVATE_addCurrentSegment(),l)throw new FirestoreError(Nt.INVALID_ARGUMENT,"Unterminated ` in path: "+e);return new FieldPath$1(i)}static emptyPath(){return new FieldPath$1([])}}
/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class DocumentKey{constructor(e){this.path=e}static fromPath(e){return new DocumentKey(ResourcePath.fromString(e))}static fromName(e){return new DocumentKey(ResourcePath.fromString(e).popFirst(5))}static empty(){return new DocumentKey(ResourcePath.emptyPath())}get collectionGroup(){return this.path.popLast().lastSegment()}hasCollectionId(e){return this.path.length>=2&&this.path.get(this.path.length-2)===e}getCollectionGroup(){return this.path.get(this.path.length-2)}getCollectionPath(){return this.path.popLast()}isEqual(e){return null!==e&&0===ResourcePath.comparator(this.path,e.path)}toString(){return this.path.toString()}static comparator(e,i){return ResourcePath.comparator(e.path,i.path)}static isDocumentKey(e){return e.length%2==0}static fromSegments(e){return new DocumentKey(new ResourcePath(e.slice()))}}function __PRIVATE_newIndexOffsetFromDocument(e){return new IndexOffset(e.readTime,e.key,-1)}class IndexOffset{constructor(e,i,s){this.readTime=e,this.documentKey=i,this.largestBatchId=s}static min(){return new IndexOffset(SnapshotVersion.min(),DocumentKey.empty(),-1)}static max(){return new IndexOffset(SnapshotVersion.max(),DocumentKey.empty(),-1)}}function __PRIVATE_indexOffsetComparator(e,i){let s=e.readTime.compareTo(i.readTime);return 0!==s?s:(s=DocumentKey.comparator(e.documentKey,i.documentKey),0!==s?s:__PRIVATE_primitiveComparator(e.largestBatchId,i.largestBatchId)
/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */)}class PersistenceTransaction{constructor(){this.onCommittedListeners=[]}addOnCommittedListener(e){this.onCommittedListeners.push(e)}raiseOnCommittedEvent(){this.onCommittedListeners.forEach(e=>e())}}
/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function __PRIVATE_ignoreIfPrimaryLeaseLoss(e){if(e.code!==Nt.FAILED_PRECONDITION||"The current tab is not in the required state to perform this operation. It might be necessary to refresh the browser tab."!==e.message)throw e;__PRIVATE_logDebug("LocalStore","Unexpectedly lost primary lease")}
/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class PersistencePromise{constructor(e){this.nextCallback=null,this.catchCallback=null,this.result=void 0,this.error=void 0,this.isDone=!1,this.callbackAttached=!1,e(e=>{this.isDone=!0,this.result=e,this.nextCallback&&this.nextCallback(e)},e=>{this.isDone=!0,this.error=e,this.catchCallback&&this.catchCallback(e)})}catch(e){return this.next(void 0,e)}next(e,i){return this.callbackAttached&&fail(),this.callbackAttached=!0,this.isDone?this.error?this.wrapFailure(i,this.error):this.wrapSuccess(e,this.result):new PersistencePromise((s,o)=>{this.nextCallback=i=>{this.wrapSuccess(e,i).next(s,o)},this.catchCallback=e=>{this.wrapFailure(i,e).next(s,o)}})}toPromise(){return new Promise((e,i)=>{this.next(e,i)})}wrapUserFunction(e){try{const i=e();return i instanceof PersistencePromise?i:PersistencePromise.resolve(i)}catch(i){return PersistencePromise.reject(i)}}wrapSuccess(e,i){return e?this.wrapUserFunction(()=>e(i)):PersistencePromise.resolve(i)}wrapFailure(e,i){return e?this.wrapUserFunction(()=>e(i)):PersistencePromise.reject(i)}static resolve(e){return new PersistencePromise((i,s)=>{i(e)})}static reject(e){return new PersistencePromise((i,s)=>{s(e)})}static waitFor(e){return new PersistencePromise((i,s)=>{let o=0,l=0,h=!1;e.forEach(e=>{++o,e.next(()=>{++l,h&&l===o&&i()},e=>s(e))}),h=!0,l===o&&i()})}static or(e){let i=PersistencePromise.resolve(!1);for(const s of e)i=i.next(e=>e?PersistencePromise.resolve(e):s());return i}static forEach(e,i){const s=[];return e.forEach((e,o)=>{s.push(i.call(this,e,o))}),this.waitFor(s)}static mapArray(e,i){return new PersistencePromise((s,o)=>{const l=e.length,h=new Array(l);let d=0;for(let _=0;_<l;_++){const f=_;i(e[f]).next(e=>{h[f]=e,++d,d===l&&s(h)},e=>o(e))}})}static doWhile(e,i){return new PersistencePromise((s,o)=>{const process2=()=>{!0===e()?i().next(()=>{process2()},o):s()};process2()})}}function __PRIVATE_isIndexedDbTransactionError(e){return"IndexedDbTransactionError"===e.name}
/**
 * @license
 * Copyright 2018 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class __PRIVATE_ListenSequence{constructor(e,i){this.previousValue=e,i&&(i.sequenceNumberHandler=e=>this.ie(e),this.se=e=>i.writeSequenceNumber(e))}ie(e){return this.previousValue=Math.max(e,this.previousValue),this.previousValue}next(){const e=++this.previousValue;return this.se&&this.se(e),e}}function __PRIVATE_isNullOrUndefined(e){return null==e}function __PRIVATE_isNegativeZero(e){return 0===e&&1/e==-1/0}
/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
function __PRIVATE_objectSize(e){let i=0;for(const s in e)Object.prototype.hasOwnProperty.call(e,s)&&i++;return i}function forEach(e,i){for(const s in e)Object.prototype.hasOwnProperty.call(e,s)&&i(s,e[s])}function isEmpty(e){for(const i in e)if(Object.prototype.hasOwnProperty.call(e,i))return!1;return!0}
/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */__PRIVATE_ListenSequence.oe=-1;class SortedMap{constructor(e,i){this.comparator=e,this.root=i||LLRBNode.EMPTY}insert(e,i){return new SortedMap(this.comparator,this.root.insert(e,i,this.comparator).copy(null,null,LLRBNode.BLACK,null,null))}remove(e){return new SortedMap(this.comparator,this.root.remove(e,this.comparator).copy(null,null,LLRBNode.BLACK,null,null))}get(e){let i=this.root;for(;!i.isEmpty();){const s=this.comparator(e,i.key);if(0===s)return i.value;s<0?i=i.left:s>0&&(i=i.right)}return null}indexOf(e){let i=0,s=this.root;for(;!s.isEmpty();){const o=this.comparator(e,s.key);if(0===o)return i+s.left.size;o<0?s=s.left:(i+=s.left.size+1,s=s.right)}return-1}isEmpty(){return this.root.isEmpty()}get size(){return this.root.size}minKey(){return this.root.minKey()}maxKey(){return this.root.maxKey()}inorderTraversal(e){return this.root.inorderTraversal(e)}forEach(e){this.inorderTraversal((i,s)=>(e(i,s),!1))}toString(){const e=[];return this.inorderTraversal((i,s)=>(e.push(`${i}:${s}`),!1)),`{${e.join(", ")}}`}reverseTraversal(e){return this.root.reverseTraversal(e)}getIterator(){return new SortedMapIterator(this.root,null,this.comparator,!1)}getIteratorFrom(e){return new SortedMapIterator(this.root,e,this.comparator,!1)}getReverseIterator(){return new SortedMapIterator(this.root,null,this.comparator,!0)}getReverseIteratorFrom(e){return new SortedMapIterator(this.root,e,this.comparator,!0)}}class SortedMapIterator{constructor(e,i,s,o){this.isReverse=o,this.nodeStack=[];let l=1;for(;!e.isEmpty();)if(l=i?s(e.key,i):1,i&&o&&(l*=-1),l<0)e=this.isReverse?e.left:e.right;else{if(0===l){this.nodeStack.push(e);break}this.nodeStack.push(e),e=this.isReverse?e.right:e.left}}getNext(){let e=this.nodeStack.pop();const i={key:e.key,value:e.value};if(this.isReverse)for(e=e.left;!e.isEmpty();)this.nodeStack.push(e),e=e.right;else for(e=e.right;!e.isEmpty();)this.nodeStack.push(e),e=e.left;return i}hasNext(){return this.nodeStack.length>0}peek(){if(0===this.nodeStack.length)return null;const e=this.nodeStack[this.nodeStack.length-1];return{key:e.key,value:e.value}}}class LLRBNode{constructor(e,i,s,o,l){this.key=e,this.value=i,this.color=null!=s?s:LLRBNode.RED,this.left=null!=o?o:LLRBNode.EMPTY,this.right=null!=l?l:LLRBNode.EMPTY,this.size=this.left.size+1+this.right.size}copy(e,i,s,o,l){return new LLRBNode(null!=e?e:this.key,null!=i?i:this.value,null!=s?s:this.color,null!=o?o:this.left,null!=l?l:this.right)}isEmpty(){return!1}inorderTraversal(e){return this.left.inorderTraversal(e)||e(this.key,this.value)||this.right.inorderTraversal(e)}reverseTraversal(e){return this.right.reverseTraversal(e)||e(this.key,this.value)||this.left.reverseTraversal(e)}min(){return this.left.isEmpty()?this:this.left.min()}minKey(){return this.min().key}maxKey(){return this.right.isEmpty()?this.key:this.right.maxKey()}insert(e,i,s){let o=this;const l=s(e,o.key);return o=l<0?o.copy(null,null,null,o.left.insert(e,i,s),null):0===l?o.copy(null,i,null,null,null):o.copy(null,null,null,null,o.right.insert(e,i,s)),o.fixUp()}removeMin(){if(this.left.isEmpty())return LLRBNode.EMPTY;let e=this;return e.left.isRed()||e.left.left.isRed()||(e=e.moveRedLeft()),e=e.copy(null,null,null,e.left.removeMin(),null),e.fixUp()}remove(e,i){let s,o=this;if(i(e,o.key)<0)o.left.isEmpty()||o.left.isRed()||o.left.left.isRed()||(o=o.moveRedLeft()),o=o.copy(null,null,null,o.left.remove(e,i),null);else{if(o.left.isRed()&&(o=o.rotateRight()),o.right.isEmpty()||o.right.isRed()||o.right.left.isRed()||(o=o.moveRedRight()),0===i(e,o.key)){if(o.right.isEmpty())return LLRBNode.EMPTY;s=o.right.min(),o=o.copy(s.key,s.value,null,null,o.right.removeMin())}o=o.copy(null,null,null,null,o.right.remove(e,i))}return o.fixUp()}isRed(){return this.color}fixUp(){let e=this;return e.right.isRed()&&!e.left.isRed()&&(e=e.rotateLeft()),e.left.isRed()&&e.left.left.isRed()&&(e=e.rotateRight()),e.left.isRed()&&e.right.isRed()&&(e=e.colorFlip()),e}moveRedLeft(){let e=this.colorFlip();return e.right.left.isRed()&&(e=e.copy(null,null,null,null,e.right.rotateRight()),e=e.rotateLeft(),e=e.colorFlip()),e}moveRedRight(){let e=this.colorFlip();return e.left.left.isRed()&&(e=e.rotateRight(),e=e.colorFlip()),e}rotateLeft(){const e=this.copy(null,null,LLRBNode.RED,null,this.right.left);return this.right.copy(null,null,this.color,e,null)}rotateRight(){const e=this.copy(null,null,LLRBNode.RED,this.left.right,null);return this.left.copy(null,null,this.color,null,e)}colorFlip(){const e=this.left.copy(null,null,!this.left.color,null,null),i=this.right.copy(null,null,!this.right.color,null,null);return this.copy(null,null,!this.color,e,i)}checkMaxDepth(){const e=this.check();return Math.pow(2,e)<=this.size+1}check(){if(this.isRed()&&this.left.isRed())throw fail();if(this.right.isRed())throw fail();const e=this.left.check();if(e!==this.right.check())throw fail();return e+(this.isRed()?0:1)}}LLRBNode.EMPTY=null,LLRBNode.RED=!0,LLRBNode.BLACK=!1,LLRBNode.EMPTY=new class{constructor(){this.size=0}get key(){throw fail()}get value(){throw fail()}get color(){throw fail()}get left(){throw fail()}get right(){throw fail()}copy(e,i,s,o,l){return this}insert(e,i,s){return new LLRBNode(e,i)}remove(e,i){return this}isEmpty(){return!0}inorderTraversal(e){return!1}reverseTraversal(e){return!1}minKey(){return null}maxKey(){return null}isRed(){return!1}checkMaxDepth(){return!0}check(){return 0}};
/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
class SortedSet{constructor(e){this.comparator=e,this.data=new SortedMap(this.comparator)}has(e){return null!==this.data.get(e)}first(){return this.data.minKey()}last(){return this.data.maxKey()}get size(){return this.data.size}indexOf(e){return this.data.indexOf(e)}forEach(e){this.data.inorderTraversal((i,s)=>(e(i),!1))}forEachInRange(e,i){const s=this.data.getIteratorFrom(e[0]);for(;s.hasNext();){const o=s.getNext();if(this.comparator(o.key,e[1])>=0)return;i(o.key)}}forEachWhile(e,i){let s;for(s=void 0!==i?this.data.getIteratorFrom(i):this.data.getIterator();s.hasNext();)if(!e(s.getNext().key))return}firstAfterOrEqual(e){const i=this.data.getIteratorFrom(e);return i.hasNext()?i.getNext().key:null}getIterator(){return new SortedSetIterator(this.data.getIterator())}getIteratorFrom(e){return new SortedSetIterator(this.data.getIteratorFrom(e))}add(e){return this.copy(this.data.remove(e).insert(e,!0))}delete(e){return this.has(e)?this.copy(this.data.remove(e)):this}isEmpty(){return this.data.isEmpty()}unionWith(e){let i=this;return i.size<e.size&&(i=e,e=this),e.forEach(e=>{i=i.add(e)}),i}isEqual(e){if(!(e instanceof SortedSet))return!1;if(this.size!==e.size)return!1;const i=this.data.getIterator(),s=e.data.getIterator();for(;i.hasNext();){const e=i.getNext().key,o=s.getNext().key;if(0!==this.comparator(e,o))return!1}return!0}toArray(){const e=[];return this.forEach(i=>{e.push(i)}),e}toString(){const e=[];return this.forEach(i=>e.push(i)),"SortedSet("+e.toString()+")"}copy(e){const i=new SortedSet(this.comparator);return i.data=e,i}}class SortedSetIterator{constructor(e){this.iter=e}getNext(){return this.iter.getNext().key}hasNext(){return this.iter.hasNext()}}
/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class FieldMask{constructor(e){this.fields=e,e.sort(FieldPath$1.comparator)}static empty(){return new FieldMask([])}unionWith(e){let i=new SortedSet(FieldPath$1.comparator);for(const s of this.fields)i=i.add(s);for(const s of e)i=i.add(s);return new FieldMask(i.toArray())}covers(e){for(const i of this.fields)if(i.isPrefixOf(e))return!0;return!1}isEqual(e){return __PRIVATE_arrayEquals(this.fields,e.fields,(e,i)=>e.isEqual(i))}}
/**
 * @license
 * Copyright 2023 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class __PRIVATE_Base64DecodeError extends Error{constructor(){super(...arguments),this.name="Base64DecodeError"}}
/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class ByteString{constructor(e){this.binaryString=e}static fromBase64String(e){const i=function(e){try{return atob(e)}catch(i){throw"undefined"!=typeof DOMException&&i instanceof DOMException?new __PRIVATE_Base64DecodeError("Invalid base64 string: "+i):i}}(e);return new ByteString(i)}static fromUint8Array(e){const i=function(e){let i="";for(let s=0;s<e.length;++s)i+=String.fromCharCode(e[s]);return i}(e);return new ByteString(i)}[Symbol.iterator](){let e=0;return{next:()=>e<this.binaryString.length?{value:this.binaryString.charCodeAt(e++),done:!1}:{value:void 0,done:!0}}}toBase64(){return e=this.binaryString,btoa(e);var e}toUint8Array(){return function(e){const i=new Uint8Array(e.length);for(let s=0;s<e.length;s++)i[s]=e.charCodeAt(s);return i}(this.binaryString)}approximateByteSize(){return 2*this.binaryString.length}compareTo(e){return __PRIVATE_primitiveComparator(this.binaryString,e.binaryString)}isEqual(e){return this.binaryString===e.binaryString}}ByteString.EMPTY_BYTE_STRING=new ByteString("");const Mt=new RegExp(/^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\d(?:\.(\d+))?Z$/);function __PRIVATE_normalizeTimestamp(e){if(__PRIVATE_hardAssert(!!e),"string"==typeof e){let i=0;const s=Mt.exec(e);if(__PRIVATE_hardAssert(!!s),s[1]){let e=s[1];e=(e+"000000000").substr(0,9),i=Number(e)}const o=new Date(e);return{seconds:Math.floor(o.getTime()/1e3),nanos:i}}return{seconds:__PRIVATE_normalizeNumber(e.seconds),nanos:__PRIVATE_normalizeNumber(e.nanos)}}function __PRIVATE_normalizeNumber(e){return"number"==typeof e?e:"string"==typeof e?Number(e):0}function __PRIVATE_normalizeByteString(e){return"string"==typeof e?ByteString.fromBase64String(e):ByteString.fromUint8Array(e)}
/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function __PRIVATE_isServerTimestamp(e){var i,s;return"server_timestamp"===(null===(s=((null===(i=null==e?void 0:e.mapValue)||void 0===i?void 0:i.fields)||{}).__type__)||void 0===s?void 0:s.stringValue)}function __PRIVATE_getPreviousValue(e){const i=e.mapValue.fields.__previous_value__;return __PRIVATE_isServerTimestamp(i)?__PRIVATE_getPreviousValue(i):i}function __PRIVATE_getLocalWriteTime(e){const i=__PRIVATE_normalizeTimestamp(e.mapValue.fields.__local_write_time__.timestampValue);return new Timestamp(i.seconds,i.nanos)}
/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class DatabaseInfo{constructor(e,i,s,o,l,h,d,_,f){this.databaseId=e,this.appId=i,this.persistenceKey=s,this.host=o,this.ssl=l,this.forceLongPolling=h,this.autoDetectLongPolling=d,this.longPollingOptions=_,this.useFetchStreams=f}}class DatabaseId{constructor(e,i){this.projectId=e,this.database=i||"(default)"}static empty(){return new DatabaseId("","")}get isDefaultDatabase(){return"(default)"===this.database}isEqual(e){return e instanceof DatabaseId&&e.projectId===this.projectId&&e.database===this.database}}
/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Ft={fields:{__type__:{stringValue:"__max__"}}};function __PRIVATE_typeOrder(e){return"nullValue"in e?0:"booleanValue"in e?1:"integerValue"in e||"doubleValue"in e?2:"timestampValue"in e?3:"stringValue"in e?5:"bytesValue"in e?6:"referenceValue"in e?7:"geoPointValue"in e?8:"arrayValue"in e?9:"mapValue"in e?__PRIVATE_isServerTimestamp(e)?4:function(e){return"__max__"===(((e.mapValue||{}).fields||{}).__type__||{}).stringValue}
/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */(e)?9007199254740991:function(e){var i,s;return"__vector__"===(null===(s=((null===(i=null==e?void 0:e.mapValue)||void 0===i?void 0:i.fields)||{}).__type__)||void 0===s?void 0:s.stringValue)}(e)?10:11:fail()}function __PRIVATE_valueEquals(e,i){if(e===i)return!0;const s=__PRIVATE_typeOrder(e);if(s!==__PRIVATE_typeOrder(i))return!1;switch(s){case 0:case 9007199254740991:return!0;case 1:return e.booleanValue===i.booleanValue;case 4:return __PRIVATE_getLocalWriteTime(e).isEqual(__PRIVATE_getLocalWriteTime(i));case 3:return function(e,i){if("string"==typeof e.timestampValue&&"string"==typeof i.timestampValue&&e.timestampValue.length===i.timestampValue.length)return e.timestampValue===i.timestampValue;const s=__PRIVATE_normalizeTimestamp(e.timestampValue),o=__PRIVATE_normalizeTimestamp(i.timestampValue);return s.seconds===o.seconds&&s.nanos===o.nanos}(e,i);case 5:return e.stringValue===i.stringValue;case 6:return o=i,__PRIVATE_normalizeByteString(e.bytesValue).isEqual(__PRIVATE_normalizeByteString(o.bytesValue));case 7:return e.referenceValue===i.referenceValue;case 8:return function(e,i){return __PRIVATE_normalizeNumber(e.geoPointValue.latitude)===__PRIVATE_normalizeNumber(i.geoPointValue.latitude)&&__PRIVATE_normalizeNumber(e.geoPointValue.longitude)===__PRIVATE_normalizeNumber(i.geoPointValue.longitude)}(e,i);case 2:return function(e,i){if("integerValue"in e&&"integerValue"in i)return __PRIVATE_normalizeNumber(e.integerValue)===__PRIVATE_normalizeNumber(i.integerValue);if("doubleValue"in e&&"doubleValue"in i){const s=__PRIVATE_normalizeNumber(e.doubleValue),o=__PRIVATE_normalizeNumber(i.doubleValue);return s===o?__PRIVATE_isNegativeZero(s)===__PRIVATE_isNegativeZero(o):isNaN(s)&&isNaN(o)}return!1}(e,i);case 9:return __PRIVATE_arrayEquals(e.arrayValue.values||[],i.arrayValue.values||[],__PRIVATE_valueEquals);case 10:case 11:return function(e,i){const s=e.mapValue.fields||{},o=i.mapValue.fields||{};if(__PRIVATE_objectSize(s)!==__PRIVATE_objectSize(o))return!1;for(const l in s)if(s.hasOwnProperty(l)&&(void 0===o[l]||!__PRIVATE_valueEquals(s[l],o[l])))return!1;return!0}(e,i);default:return fail()}var o}function __PRIVATE_arrayValueContains(e,i){return void 0!==(e.values||[]).find(e=>__PRIVATE_valueEquals(e,i))}function __PRIVATE_valueCompare(e,i){if(e===i)return 0;const s=__PRIVATE_typeOrder(e),o=__PRIVATE_typeOrder(i);if(s!==o)return __PRIVATE_primitiveComparator(s,o);switch(s){case 0:case 9007199254740991:return 0;case 1:return __PRIVATE_primitiveComparator(e.booleanValue,i.booleanValue);case 2:return function(e,i){const s=__PRIVATE_normalizeNumber(e.integerValue||e.doubleValue),o=__PRIVATE_normalizeNumber(i.integerValue||i.doubleValue);return s<o?-1:s>o?1:s===o?0:isNaN(s)?isNaN(o)?0:-1:1}(e,i);case 3:return __PRIVATE_compareTimestamps(e.timestampValue,i.timestampValue);case 4:return __PRIVATE_compareTimestamps(__PRIVATE_getLocalWriteTime(e),__PRIVATE_getLocalWriteTime(i));case 5:return __PRIVATE_primitiveComparator(e.stringValue,i.stringValue);case 6:return function(e,i){const s=__PRIVATE_normalizeByteString(e),o=__PRIVATE_normalizeByteString(i);return s.compareTo(o)}(e.bytesValue,i.bytesValue);case 7:return function(e,i){const s=e.split("/"),o=i.split("/");for(let l=0;l<s.length&&l<o.length;l++){const e=__PRIVATE_primitiveComparator(s[l],o[l]);if(0!==e)return e}return __PRIVATE_primitiveComparator(s.length,o.length)}(e.referenceValue,i.referenceValue);case 8:return function(e,i){const s=__PRIVATE_primitiveComparator(__PRIVATE_normalizeNumber(e.latitude),__PRIVATE_normalizeNumber(i.latitude));return 0!==s?s:__PRIVATE_primitiveComparator(__PRIVATE_normalizeNumber(e.longitude),__PRIVATE_normalizeNumber(i.longitude))}(e.geoPointValue,i.geoPointValue);case 9:return __PRIVATE_compareArrays(e.arrayValue,i.arrayValue);case 10:return function(e,i){var s,o,l,h;const d=e.fields||{},_=i.fields||{},f=null===(s=d.value)||void 0===s?void 0:s.arrayValue,g=null===(o=_.value)||void 0===o?void 0:o.arrayValue,v=__PRIVATE_primitiveComparator((null===(l=null==f?void 0:f.values)||void 0===l?void 0:l.length)||0,(null===(h=null==g?void 0:g.values)||void 0===h?void 0:h.length)||0);return 0!==v?v:__PRIVATE_compareArrays(f,g)}(e.mapValue,i.mapValue);case 11:return function(e,i){if(e===Ft&&i===Ft)return 0;if(e===Ft)return 1;if(i===Ft)return-1;const s=e.fields||{},o=Object.keys(s),l=i.fields||{},h=Object.keys(l);o.sort(),h.sort();for(let d=0;d<o.length&&d<h.length;++d){const e=__PRIVATE_primitiveComparator(o[d],h[d]);if(0!==e)return e;const i=__PRIVATE_valueCompare(s[o[d]],l[h[d]]);if(0!==i)return i}return __PRIVATE_primitiveComparator(o.length,h.length)}(e.mapValue,i.mapValue);default:throw fail()}}function __PRIVATE_compareTimestamps(e,i){if("string"==typeof e&&"string"==typeof i&&e.length===i.length)return __PRIVATE_primitiveComparator(e,i);const s=__PRIVATE_normalizeTimestamp(e),o=__PRIVATE_normalizeTimestamp(i),l=__PRIVATE_primitiveComparator(s.seconds,o.seconds);return 0!==l?l:__PRIVATE_primitiveComparator(s.nanos,o.nanos)}function __PRIVATE_compareArrays(e,i){const s=e.values||[],o=i.values||[];for(let l=0;l<s.length&&l<o.length;++l){const e=__PRIVATE_valueCompare(s[l],o[l]);if(e)return e}return __PRIVATE_primitiveComparator(s.length,o.length)}function canonicalId(e){return __PRIVATE_canonifyValue(e)}function __PRIVATE_canonifyValue(e){return"nullValue"in e?"null":"booleanValue"in e?""+e.booleanValue:"integerValue"in e?""+e.integerValue:"doubleValue"in e?""+e.doubleValue:"timestampValue"in e?function(e){const i=__PRIVATE_normalizeTimestamp(e);return`time(${i.seconds},${i.nanos})`}(e.timestampValue):"stringValue"in e?e.stringValue:"bytesValue"in e?__PRIVATE_normalizeByteString(e.bytesValue).toBase64():"referenceValue"in e?function(e){return DocumentKey.fromName(e).toString()}(e.referenceValue):"geoPointValue"in e?function(e){return`geo(${e.latitude},${e.longitude})`}(e.geoPointValue):"arrayValue"in e?function(e){let i="[",s=!0;for(const o of e.values||[])s?s=!1:i+=",",i+=__PRIVATE_canonifyValue(o);return i+"]"}(e.arrayValue):"mapValue"in e?function(e){const i=Object.keys(e.fields||{}).sort();let s="{",o=!0;for(const l of i)o?o=!1:s+=",",s+=`${l}:${__PRIVATE_canonifyValue(e.fields[l])}`;return s+"}"}(e.mapValue):fail()}function __PRIVATE_refValue(e,i){return{referenceValue:`projects/${e.projectId}/databases/${e.database}/documents/${i.path.canonicalString()}`}}function isInteger(e){return!!e&&"integerValue"in e}function isArray(e){return!!e&&"arrayValue"in e}function __PRIVATE_isNullValue(e){return!!e&&"nullValue"in e}function __PRIVATE_isNanValue(e){return!!e&&"doubleValue"in e&&isNaN(Number(e.doubleValue))}function __PRIVATE_isMapValue(e){return!!e&&"mapValue"in e}function __PRIVATE_deepClone(e){if(e.geoPointValue)return{geoPointValue:Object.assign({},e.geoPointValue)};if(e.timestampValue&&"object"==typeof e.timestampValue)return{timestampValue:Object.assign({},e.timestampValue)};if(e.mapValue){const i={mapValue:{fields:{}}};return forEach(e.mapValue.fields,(e,s)=>i.mapValue.fields[e]=__PRIVATE_deepClone(s)),i}if(e.arrayValue){const i={arrayValue:{values:[]}};for(let s=0;s<(e.arrayValue.values||[]).length;++s)i.arrayValue.values[s]=__PRIVATE_deepClone(e.arrayValue.values[s]);return i}return Object.assign({},e)}class ObjectValue{constructor(e){this.value=e}static empty(){return new ObjectValue({mapValue:{}})}field(e){if(e.isEmpty())return this.value;{let i=this.value;for(let s=0;s<e.length-1;++s)if(i=(i.mapValue.fields||{})[e.get(s)],!__PRIVATE_isMapValue(i))return null;return i=(i.mapValue.fields||{})[e.lastSegment()],i||null}}set(e,i){this.getFieldsMap(e.popLast())[e.lastSegment()]=__PRIVATE_deepClone(i)}setAll(e){let i=FieldPath$1.emptyPath(),s={},o=[];e.forEach((e,l)=>{if(!i.isImmediateParentOf(l)){const e=this.getFieldsMap(i);this.applyChanges(e,s,o),s={},o=[],i=l.popLast()}e?s[l.lastSegment()]=__PRIVATE_deepClone(e):o.push(l.lastSegment())});const l=this.getFieldsMap(i);this.applyChanges(l,s,o)}delete(e){const i=this.field(e.popLast());__PRIVATE_isMapValue(i)&&i.mapValue.fields&&delete i.mapValue.fields[e.lastSegment()]}isEqual(e){return __PRIVATE_valueEquals(this.value,e.value)}getFieldsMap(e){let i=this.value;i.mapValue.fields||(i.mapValue={fields:{}});for(let s=0;s<e.length;++s){let o=i.mapValue.fields[e.get(s)];__PRIVATE_isMapValue(o)&&o.mapValue.fields||(o={mapValue:{fields:{}}},i.mapValue.fields[e.get(s)]=o),i=o}return i.mapValue.fields}applyChanges(e,i,s){forEach(i,(i,s)=>e[i]=s);for(const o of s)delete e[o]}clone(){return new ObjectValue(__PRIVATE_deepClone(this.value))}}function __PRIVATE_extractFieldMask(e){const i=[];return forEach(e.fields,(e,s)=>{const o=new FieldPath$1([e]);if(__PRIVATE_isMapValue(s)){const e=__PRIVATE_extractFieldMask(s.mapValue).fields;if(0===e.length)i.push(o);else for(const s of e)i.push(o.child(s))}else i.push(o)}),new FieldMask(i)
/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */}class MutableDocument{constructor(e,i,s,o,l,h,d){this.key=e,this.documentType=i,this.version=s,this.readTime=o,this.createTime=l,this.data=h,this.documentState=d}static newInvalidDocument(e){return new MutableDocument(e,0,SnapshotVersion.min(),SnapshotVersion.min(),SnapshotVersion.min(),ObjectValue.empty(),0)}static newFoundDocument(e,i,s,o){return new MutableDocument(e,1,i,SnapshotVersion.min(),s,o,0)}static newNoDocument(e,i){return new MutableDocument(e,2,i,SnapshotVersion.min(),SnapshotVersion.min(),ObjectValue.empty(),0)}static newUnknownDocument(e,i){return new MutableDocument(e,3,i,SnapshotVersion.min(),SnapshotVersion.min(),ObjectValue.empty(),2)}convertToFoundDocument(e,i){return!this.createTime.isEqual(SnapshotVersion.min())||2!==this.documentType&&0!==this.documentType||(this.createTime=e),this.version=e,this.documentType=1,this.data=i,this.documentState=0,this}convertToNoDocument(e){return this.version=e,this.documentType=2,this.data=ObjectValue.empty(),this.documentState=0,this}convertToUnknownDocument(e){return this.version=e,this.documentType=3,this.data=ObjectValue.empty(),this.documentState=2,this}setHasCommittedMutations(){return this.documentState=2,this}setHasLocalMutations(){return this.documentState=1,this.version=SnapshotVersion.min(),this}setReadTime(e){return this.readTime=e,this}get hasLocalMutations(){return 1===this.documentState}get hasCommittedMutations(){return 2===this.documentState}get hasPendingWrites(){return this.hasLocalMutations||this.hasCommittedMutations}isValidDocument(){return 0!==this.documentType}isFoundDocument(){return 1===this.documentType}isNoDocument(){return 2===this.documentType}isUnknownDocument(){return 3===this.documentType}isEqual(e){return e instanceof MutableDocument&&this.key.isEqual(e.key)&&this.version.isEqual(e.version)&&this.documentType===e.documentType&&this.documentState===e.documentState&&this.data.isEqual(e.data)}mutableCopy(){return new MutableDocument(this.key,this.documentType,this.version,this.readTime,this.createTime,this.data.clone(),this.documentState)}toString(){return`Document(${this.key}, ${this.version}, ${JSON.stringify(this.data.value)}, {createTime: ${this.createTime}}), {documentType: ${this.documentType}}), {documentState: ${this.documentState}})`}}
/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Bound{constructor(e,i){this.position=e,this.inclusive=i}}function __PRIVATE_boundCompareToDocument(e,i,s){let o=0;for(let l=0;l<e.position.length;l++){const h=i[l],d=e.position[l];if(o=h.field.isKeyField()?DocumentKey.comparator(DocumentKey.fromName(d.referenceValue),s.key):__PRIVATE_valueCompare(d,s.data.field(h.field)),"desc"===h.dir&&(o*=-1),0!==o)break}return o}function __PRIVATE_boundEquals(e,i){if(null===e)return null===i;if(null===i)return!1;if(e.inclusive!==i.inclusive||e.position.length!==i.position.length)return!1;for(let s=0;s<e.position.length;s++)if(!__PRIVATE_valueEquals(e.position[s],i.position[s]))return!1;return!0}
/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class OrderBy{constructor(e,i="asc"){this.field=e,this.dir=i}}function __PRIVATE_orderByEquals(e,i){return e.dir===i.dir&&e.field.isEqual(i.field)}
/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Filter{}class FieldFilter extends Filter{constructor(e,i,s){super(),this.field=e,this.op=i,this.value=s}static create(e,i,s){return e.isKeyField()?"in"===i||"not-in"===i?this.createKeyFieldInFilter(e,i,s):new __PRIVATE_KeyFieldFilter(e,i,s):"array-contains"===i?new __PRIVATE_ArrayContainsFilter(e,s):"in"===i?new __PRIVATE_InFilter(e,s):"not-in"===i?new __PRIVATE_NotInFilter(e,s):"array-contains-any"===i?new __PRIVATE_ArrayContainsAnyFilter(e,s):new FieldFilter(e,i,s)}static createKeyFieldInFilter(e,i,s){return"in"===i?new __PRIVATE_KeyFieldInFilter(e,s):new __PRIVATE_KeyFieldNotInFilter(e,s)}matches(e){const i=e.data.field(this.field);return"!="===this.op?null!==i&&this.matchesComparison(__PRIVATE_valueCompare(i,this.value)):null!==i&&__PRIVATE_typeOrder(this.value)===__PRIVATE_typeOrder(i)&&this.matchesComparison(__PRIVATE_valueCompare(i,this.value))}matchesComparison(e){switch(this.op){case"<":return e<0;case"<=":return e<=0;case"==":return 0===e;case"!=":return 0!==e;case">":return e>0;case">=":return e>=0;default:return fail()}}isInequality(){return["<","<=",">",">=","!=","not-in"].indexOf(this.op)>=0}getFlattenedFilters(){return[this]}getFilters(){return[this]}}class CompositeFilter extends Filter{constructor(e,i){super(),this.filters=e,this.op=i,this.ae=null}static create(e,i){return new CompositeFilter(e,i)}matches(e){return __PRIVATE_compositeFilterIsConjunction(this)?void 0===this.filters.find(i=>!i.matches(e)):void 0!==this.filters.find(i=>i.matches(e))}getFlattenedFilters(){return null!==this.ae||(this.ae=this.filters.reduce((e,i)=>e.concat(i.getFlattenedFilters()),[])),this.ae}getFilters(){return Object.assign([],this.filters)}}function __PRIVATE_compositeFilterIsConjunction(e){return"and"===e.op}function __PRIVATE_compositeFilterIsFlatConjunction(e){return function(e){for(const i of e.filters)if(i instanceof CompositeFilter)return!1;return!0}(e)&&__PRIVATE_compositeFilterIsConjunction(e)}function __PRIVATE_canonifyFilter(e){if(e instanceof FieldFilter)return e.field.canonicalString()+e.op.toString()+canonicalId(e.value);if(__PRIVATE_compositeFilterIsFlatConjunction(e))return e.filters.map(e=>__PRIVATE_canonifyFilter(e)).join(",");{const i=e.filters.map(e=>__PRIVATE_canonifyFilter(e)).join(",");return`${e.op}(${i})`}}function __PRIVATE_filterEquals(e,i){return e instanceof FieldFilter?(s=e,(o=i)instanceof FieldFilter&&s.op===o.op&&s.field.isEqual(o.field)&&__PRIVATE_valueEquals(s.value,o.value)):e instanceof CompositeFilter?function(e,i){return i instanceof CompositeFilter&&e.op===i.op&&e.filters.length===i.filters.length&&e.filters.reduce((e,s,o)=>e&&__PRIVATE_filterEquals(s,i.filters[o]),!0)}(e,i):void fail();var s,o}function __PRIVATE_stringifyFilter(e){return e instanceof FieldFilter?`${(i=e).field.canonicalString()} ${i.op} ${canonicalId(i.value)}`:e instanceof CompositeFilter?function(e){return e.op.toString()+" {"+e.getFilters().map(__PRIVATE_stringifyFilter).join(" ,")+"}"}(e):"Filter";var i}class __PRIVATE_KeyFieldFilter extends FieldFilter{constructor(e,i,s){super(e,i,s),this.key=DocumentKey.fromName(s.referenceValue)}matches(e){const i=DocumentKey.comparator(e.key,this.key);return this.matchesComparison(i)}}class __PRIVATE_KeyFieldInFilter extends FieldFilter{constructor(e,i){super(e,"in",i),this.keys=__PRIVATE_extractDocumentKeysFromArrayValue("in",i)}matches(e){return this.keys.some(i=>i.isEqual(e.key))}}class __PRIVATE_KeyFieldNotInFilter extends FieldFilter{constructor(e,i){super(e,"not-in",i),this.keys=__PRIVATE_extractDocumentKeysFromArrayValue("not-in",i)}matches(e){return!this.keys.some(i=>i.isEqual(e.key))}}function __PRIVATE_extractDocumentKeysFromArrayValue(e,i){var s;return((null===(s=i.arrayValue)||void 0===s?void 0:s.values)||[]).map(e=>DocumentKey.fromName(e.referenceValue))}class __PRIVATE_ArrayContainsFilter extends FieldFilter{constructor(e,i){super(e,"array-contains",i)}matches(e){const i=e.data.field(this.field);return isArray(i)&&__PRIVATE_arrayValueContains(i.arrayValue,this.value)}}class __PRIVATE_InFilter extends FieldFilter{constructor(e,i){super(e,"in",i)}matches(e){const i=e.data.field(this.field);return null!==i&&__PRIVATE_arrayValueContains(this.value.arrayValue,i)}}class __PRIVATE_NotInFilter extends FieldFilter{constructor(e,i){super(e,"not-in",i)}matches(e){if(__PRIVATE_arrayValueContains(this.value.arrayValue,{nullValue:"NULL_VALUE"}))return!1;const i=e.data.field(this.field);return null!==i&&!__PRIVATE_arrayValueContains(this.value.arrayValue,i)}}class __PRIVATE_ArrayContainsAnyFilter extends FieldFilter{constructor(e,i){super(e,"array-contains-any",i)}matches(e){const i=e.data.field(this.field);return!(!isArray(i)||!i.arrayValue.values)&&i.arrayValue.values.some(e=>__PRIVATE_arrayValueContains(this.value.arrayValue,e))}}
/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class __PRIVATE_TargetImpl{constructor(e,i=null,s=[],o=[],l=null,h=null,d=null){this.path=e,this.collectionGroup=i,this.orderBy=s,this.filters=o,this.limit=l,this.startAt=h,this.endAt=d,this.ue=null}}function __PRIVATE_newTarget(e,i=null,s=[],o=[],l=null,h=null,d=null){return new __PRIVATE_TargetImpl(e,i,s,o,l,h,d)}function __PRIVATE_canonifyTarget(e){const i=__PRIVATE_debugCast(e);if(null===i.ue){let e=i.path.canonicalString();null!==i.collectionGroup&&(e+="|cg:"+i.collectionGroup),e+="|f:",e+=i.filters.map(e=>__PRIVATE_canonifyFilter(e)).join(","),e+="|ob:",e+=i.orderBy.map(e=>{return(i=e).field.canonicalString()+i.dir;var i}).join(","),__PRIVATE_isNullOrUndefined(i.limit)||(e+="|l:",e+=i.limit),i.startAt&&(e+="|lb:",e+=i.startAt.inclusive?"b:":"a:",e+=i.startAt.position.map(e=>canonicalId(e)).join(",")),i.endAt&&(e+="|ub:",e+=i.endAt.inclusive?"a:":"b:",e+=i.endAt.position.map(e=>canonicalId(e)).join(",")),i.ue=e}return i.ue}function __PRIVATE_targetEquals(e,i){if(e.limit!==i.limit)return!1;if(e.orderBy.length!==i.orderBy.length)return!1;for(let s=0;s<e.orderBy.length;s++)if(!__PRIVATE_orderByEquals(e.orderBy[s],i.orderBy[s]))return!1;if(e.filters.length!==i.filters.length)return!1;for(let s=0;s<e.filters.length;s++)if(!__PRIVATE_filterEquals(e.filters[s],i.filters[s]))return!1;return e.collectionGroup===i.collectionGroup&&!!e.path.isEqual(i.path)&&!!__PRIVATE_boundEquals(e.startAt,i.startAt)&&__PRIVATE_boundEquals(e.endAt,i.endAt)}function __PRIVATE_targetIsDocumentTarget(e){return DocumentKey.isDocumentKey(e.path)&&null===e.collectionGroup&&0===e.filters.length}
/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class __PRIVATE_QueryImpl{constructor(e,i=null,s=[],o=[],l=null,h="F",d=null,_=null){this.path=e,this.collectionGroup=i,this.explicitOrderBy=s,this.filters=o,this.limit=l,this.limitType=h,this.startAt=d,this.endAt=_,this.ce=null,this.le=null,this.he=null,this.startAt,this.endAt}}function __PRIVATE_newQueryForPath(e){return new __PRIVATE_QueryImpl(e)}function __PRIVATE_queryMatchesAllDocuments(e){return 0===e.filters.length&&null===e.limit&&null==e.startAt&&null==e.endAt&&(0===e.explicitOrderBy.length||1===e.explicitOrderBy.length&&e.explicitOrderBy[0].field.isKeyField())}function __PRIVATE_isCollectionGroupQuery(e){return null!==e.collectionGroup}function __PRIVATE_queryNormalizedOrderBy(e){const i=__PRIVATE_debugCast(e);if(null===i.ce){i.ce=[];const e=new Set;for(const o of i.explicitOrderBy)i.ce.push(o),e.add(o.field.canonicalString());const s=i.explicitOrderBy.length>0?i.explicitOrderBy[i.explicitOrderBy.length-1].dir:"asc";(function(e){let i=new SortedSet(FieldPath$1.comparator);return e.filters.forEach(e=>{e.getFlattenedFilters().forEach(e=>{e.isInequality()&&(i=i.add(e.field))})}),i})(i).forEach(o=>{e.has(o.canonicalString())||o.isKeyField()||i.ce.push(new OrderBy(o,s))}),e.has(FieldPath$1.keyField().canonicalString())||i.ce.push(new OrderBy(FieldPath$1.keyField(),s))}return i.ce}function __PRIVATE_queryToTarget(e){const i=__PRIVATE_debugCast(e);return i.le||(i.le=function(e,i){if("F"===e.limitType)return __PRIVATE_newTarget(e.path,e.collectionGroup,i,e.filters,e.limit,e.startAt,e.endAt);{i=i.map(e=>{const i="desc"===e.dir?"asc":"desc";return new OrderBy(e.field,i)});const s=e.endAt?new Bound(e.endAt.position,e.endAt.inclusive):null,o=e.startAt?new Bound(e.startAt.position,e.startAt.inclusive):null;return __PRIVATE_newTarget(e.path,e.collectionGroup,i,e.filters,e.limit,s,o)}}(i,__PRIVATE_queryNormalizedOrderBy(e))),i.le}function __PRIVATE_queryWithAddedFilter(e,i){const s=e.filters.concat([i]);return new __PRIVATE_QueryImpl(e.path,e.collectionGroup,e.explicitOrderBy.slice(),s,e.limit,e.limitType,e.startAt,e.endAt)}function __PRIVATE_queryWithLimit(e,i,s){return new __PRIVATE_QueryImpl(e.path,e.collectionGroup,e.explicitOrderBy.slice(),e.filters.slice(),i,s,e.startAt,e.endAt)}function __PRIVATE_queryEquals(e,i){return __PRIVATE_targetEquals(__PRIVATE_queryToTarget(e),__PRIVATE_queryToTarget(i))&&e.limitType===i.limitType}function __PRIVATE_canonifyQuery(e){return`${__PRIVATE_canonifyTarget(__PRIVATE_queryToTarget(e))}|lt:${e.limitType}`}function __PRIVATE_stringifyQuery(e){return`Query(target=${function(e){let i=e.path.canonicalString();return null!==e.collectionGroup&&(i+=" collectionGroup="+e.collectionGroup),e.filters.length>0&&(i+=`, filters: [${e.filters.map(e=>__PRIVATE_stringifyFilter(e)).join(", ")}]`),__PRIVATE_isNullOrUndefined(e.limit)||(i+=", limit: "+e.limit),e.orderBy.length>0&&(i+=`, orderBy: [${e.orderBy.map(e=>{return`${(i=e).field.canonicalString()} (${i.dir})`;var i}).join(", ")}]`),e.startAt&&(i+=", startAt: ",i+=e.startAt.inclusive?"b:":"a:",i+=e.startAt.position.map(e=>canonicalId(e)).join(",")),e.endAt&&(i+=", endAt: ",i+=e.endAt.inclusive?"a:":"b:",i+=e.endAt.position.map(e=>canonicalId(e)).join(",")),`Target(${i})`}(__PRIVATE_queryToTarget(e))}; limitType=${e.limitType})`}function __PRIVATE_queryMatches(e,i){return i.isFoundDocument()&&function(e,i){const s=i.key.path;return null!==e.collectionGroup?i.key.hasCollectionId(e.collectionGroup)&&e.path.isPrefixOf(s):DocumentKey.isDocumentKey(e.path)?e.path.isEqual(s):e.path.isImmediateParentOf(s)}(e,i)&&function(e,i){for(const s of __PRIVATE_queryNormalizedOrderBy(e))if(!s.field.isKeyField()&&null===i.data.field(s.field))return!1;return!0}(e,i)&&function(e,i){for(const s of e.filters)if(!s.matches(i))return!1;return!0}(e,i)&&(o=i,!((s=e).startAt&&!function(e,i,s){const o=__PRIVATE_boundCompareToDocument(e,i,s);return e.inclusive?o<=0:o<0}(s.startAt,__PRIVATE_queryNormalizedOrderBy(s),o)||s.endAt&&!function(e,i,s){const o=__PRIVATE_boundCompareToDocument(e,i,s);return e.inclusive?o>=0:o>0}(s.endAt,__PRIVATE_queryNormalizedOrderBy(s),o)));var s,o}function __PRIVATE_newQueryComparator(e){return(i,s)=>{let o=!1;for(const l of __PRIVATE_queryNormalizedOrderBy(e)){const e=__PRIVATE_compareDocs(l,i,s);if(0!==e)return e;o=o||l.field.isKeyField()}return 0}}function __PRIVATE_compareDocs(e,i,s){const o=e.field.isKeyField()?DocumentKey.comparator(i.key,s.key):function(e,i,s){const o=i.data.field(e),l=s.data.field(e);return null!==o&&null!==l?__PRIVATE_valueCompare(o,l):fail()}(e.field,i,s);switch(e.dir){case"asc":return o;case"desc":return-1*o;default:return fail()}}
/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class ObjectMap{constructor(e,i){this.mapKeyFn=e,this.equalsFn=i,this.inner={},this.innerSize=0}get(e){const i=this.mapKeyFn(e),s=this.inner[i];if(void 0!==s)for(const[o,l]of s)if(this.equalsFn(o,e))return l}has(e){return void 0!==this.get(e)}set(e,i){const s=this.mapKeyFn(e),o=this.inner[s];if(void 0===o)return this.inner[s]=[[e,i]],void this.innerSize++;for(let l=0;l<o.length;l++)if(this.equalsFn(o[l][0],e))return void(o[l]=[e,i]);o.push([e,i]),this.innerSize++}delete(e){const i=this.mapKeyFn(e),s=this.inner[i];if(void 0===s)return!1;for(let o=0;o<s.length;o++)if(this.equalsFn(s[o][0],e))return 1===s.length?delete this.inner[i]:s.splice(o,1),this.innerSize--,!0;return!1}forEach(e){forEach(this.inner,(i,s)=>{for(const[o,l]of s)e(o,l)})}isEmpty(){return isEmpty(this.inner)}size(){return this.innerSize}}
/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Lt=new SortedMap(DocumentKey.comparator);function __PRIVATE_mutableDocumentMap(){return Lt}const Ut=new SortedMap(DocumentKey.comparator);function documentMap(...e){let i=Ut;for(const s of e)i=i.insert(s.key,s);return i}function __PRIVATE_convertOverlayedDocumentMapToDocumentMap(e){let i=Ut;return e.forEach((e,s)=>i=i.insert(e,s.overlayedDocument)),i}function __PRIVATE_newOverlayMap(){return __PRIVATE_newDocumentKeyMap()}function __PRIVATE_newMutationMap(){return __PRIVATE_newDocumentKeyMap()}function __PRIVATE_newDocumentKeyMap(){return new ObjectMap(e=>e.toString(),(e,i)=>e.isEqual(i))}const xt=new SortedMap(DocumentKey.comparator),Bt=new SortedSet(DocumentKey.comparator);function __PRIVATE_documentKeySet(...e){let i=Bt;for(const s of e)i=i.add(s);return i}const qt=new SortedSet(__PRIVATE_primitiveComparator);
/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
function __PRIVATE_toDouble(e,i){if(e.useProto3Json){if(isNaN(i))return{doubleValue:"NaN"};if(i===1/0)return{doubleValue:"Infinity"};if(i===-1/0)return{doubleValue:"-Infinity"}}return{doubleValue:__PRIVATE_isNegativeZero(i)?"-0":i}}function __PRIVATE_toInteger(e){return{integerValue:""+e}}function toNumber(e,i){return function(e){return"number"==typeof e&&Number.isInteger(e)&&!__PRIVATE_isNegativeZero(e)&&e<=Number.MAX_SAFE_INTEGER&&e>=Number.MIN_SAFE_INTEGER}(i)?__PRIVATE_toInteger(i):__PRIVATE_toDouble(e,i)}
/**
 * @license
 * Copyright 2018 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class TransformOperation{constructor(){this._=void 0}}function __PRIVATE_applyTransformOperationToLocalView(e,i,s){return e instanceof __PRIVATE_ServerTimestampTransform?function(e,i){const s={fields:{__type__:{stringValue:"server_timestamp"},__local_write_time__:{timestampValue:{seconds:e.seconds,nanos:e.nanoseconds}}}};return i&&__PRIVATE_isServerTimestamp(i)&&(i=__PRIVATE_getPreviousValue(i)),i&&(s.fields.__previous_value__=i),{mapValue:s}}(s,i):e instanceof __PRIVATE_ArrayUnionTransformOperation?__PRIVATE_applyArrayUnionTransformOperation(e,i):e instanceof __PRIVATE_ArrayRemoveTransformOperation?__PRIVATE_applyArrayRemoveTransformOperation(e,i):function(e,i){const s=__PRIVATE_computeTransformOperationBaseValue(e,i),o=asNumber(s)+asNumber(e.Pe);return isInteger(s)&&isInteger(e.Pe)?__PRIVATE_toInteger(o):__PRIVATE_toDouble(e.serializer,o)}(e,i)}function __PRIVATE_applyTransformOperationToRemoteDocument(e,i,s){return e instanceof __PRIVATE_ArrayUnionTransformOperation?__PRIVATE_applyArrayUnionTransformOperation(e,i):e instanceof __PRIVATE_ArrayRemoveTransformOperation?__PRIVATE_applyArrayRemoveTransformOperation(e,i):s}function __PRIVATE_computeTransformOperationBaseValue(e,i){return e instanceof __PRIVATE_NumericIncrementTransformOperation?isInteger(s=i)||(o=s)&&"doubleValue"in o?i:{integerValue:0}:null;var s,o}class __PRIVATE_ServerTimestampTransform extends TransformOperation{}class __PRIVATE_ArrayUnionTransformOperation extends TransformOperation{constructor(e){super(),this.elements=e}}function __PRIVATE_applyArrayUnionTransformOperation(e,i){const s=__PRIVATE_coercedFieldValuesArray(i);for(const o of e.elements)s.some(e=>__PRIVATE_valueEquals(e,o))||s.push(o);return{arrayValue:{values:s}}}class __PRIVATE_ArrayRemoveTransformOperation extends TransformOperation{constructor(e){super(),this.elements=e}}function __PRIVATE_applyArrayRemoveTransformOperation(e,i){let s=__PRIVATE_coercedFieldValuesArray(i);for(const o of e.elements)s=s.filter(e=>!__PRIVATE_valueEquals(e,o));return{arrayValue:{values:s}}}class __PRIVATE_NumericIncrementTransformOperation extends TransformOperation{constructor(e,i){super(),this.serializer=e,this.Pe=i}}function asNumber(e){return __PRIVATE_normalizeNumber(e.integerValue||e.doubleValue)}function __PRIVATE_coercedFieldValuesArray(e){return isArray(e)&&e.arrayValue.values?e.arrayValue.values.slice():[]}
/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class FieldTransform{constructor(e,i){this.field=e,this.transform=i}}class MutationResult{constructor(e,i){this.version=e,this.transformResults=i}}class Precondition{constructor(e,i){this.updateTime=e,this.exists=i}static none(){return new Precondition}static exists(e){return new Precondition(void 0,e)}static updateTime(e){return new Precondition(e)}get isNone(){return void 0===this.updateTime&&void 0===this.exists}isEqual(e){return this.exists===e.exists&&(this.updateTime?!!e.updateTime&&this.updateTime.isEqual(e.updateTime):!e.updateTime)}}function __PRIVATE_preconditionIsValidForDocument(e,i){return void 0!==e.updateTime?i.isFoundDocument()&&i.version.isEqual(e.updateTime):void 0===e.exists||e.exists===i.isFoundDocument()}class Mutation{}function __PRIVATE_calculateOverlayMutation(e,i){if(!e.hasLocalMutations||i&&0===i.fields.length)return null;if(null===i)return e.isNoDocument()?new __PRIVATE_DeleteMutation(e.key,Precondition.none()):new __PRIVATE_SetMutation(e.key,e.data,Precondition.none());{const s=e.data,o=ObjectValue.empty();let l=new SortedSet(FieldPath$1.comparator);for(let e of i.fields)if(!l.has(e)){let i=s.field(e);null===i&&e.length>1&&(e=e.popLast(),i=s.field(e)),null===i?o.delete(e):o.set(e,i),l=l.add(e)}return new __PRIVATE_PatchMutation(e.key,o,new FieldMask(l.toArray()),Precondition.none())}}function __PRIVATE_mutationApplyToRemoteDocument(e,i,s){var o;e instanceof __PRIVATE_SetMutation?function(e,i,s){const o=e.value.clone(),l=__PRIVATE_serverTransformResults(e.fieldTransforms,i,s.transformResults);o.setAll(l),i.convertToFoundDocument(s.version,o).setHasCommittedMutations()}(e,i,s):e instanceof __PRIVATE_PatchMutation?function(e,i,s){if(!__PRIVATE_preconditionIsValidForDocument(e.precondition,i))return void i.convertToUnknownDocument(s.version);const o=__PRIVATE_serverTransformResults(e.fieldTransforms,i,s.transformResults),l=i.data;l.setAll(__PRIVATE_getPatch(e)),l.setAll(o),i.convertToFoundDocument(s.version,l).setHasCommittedMutations()}(e,i,s):(o=s,i.convertToNoDocument(o.version).setHasCommittedMutations())}function __PRIVATE_mutationApplyToLocalView(e,i,s,o){return e instanceof __PRIVATE_SetMutation?function(e,i,s,o){if(!__PRIVATE_preconditionIsValidForDocument(e.precondition,i))return s;const l=e.value.clone(),h=__PRIVATE_localTransformResults(e.fieldTransforms,o,i);return l.setAll(h),i.convertToFoundDocument(i.version,l).setHasLocalMutations(),null}(e,i,s,o):e instanceof __PRIVATE_PatchMutation?function(e,i,s,o){if(!__PRIVATE_preconditionIsValidForDocument(e.precondition,i))return s;const l=__PRIVATE_localTransformResults(e.fieldTransforms,o,i),h=i.data;return h.setAll(__PRIVATE_getPatch(e)),h.setAll(l),i.convertToFoundDocument(i.version,h).setHasLocalMutations(),null===s?null:s.unionWith(e.fieldMask.fields).unionWith(e.fieldTransforms.map(e=>e.field))}(e,i,s,o):(l=i,h=s,__PRIVATE_preconditionIsValidForDocument(e.precondition,l)?(l.convertToNoDocument(l.version).setHasLocalMutations(),null):h);var l,h}function __PRIVATE_mutationExtractBaseValue(e,i){let s=null;for(const o of e.fieldTransforms){const e=i.data.field(o.field),l=__PRIVATE_computeTransformOperationBaseValue(o.transform,e||null);null!=l&&(null===s&&(s=ObjectValue.empty()),s.set(o.field,l))}return s||null}function __PRIVATE_mutationEquals(e,i){return e.type===i.type&&!!e.key.isEqual(i.key)&&!!e.precondition.isEqual(i.precondition)&&(s=e.fieldTransforms,o=i.fieldTransforms,!!(void 0===s&&void 0===o||s&&o&&__PRIVATE_arrayEquals(s,o,(e,i)=>function(e,i){return e.field.isEqual(i.field)&&(s=e.transform,o=i.transform,s instanceof __PRIVATE_ArrayUnionTransformOperation&&o instanceof __PRIVATE_ArrayUnionTransformOperation||s instanceof __PRIVATE_ArrayRemoveTransformOperation&&o instanceof __PRIVATE_ArrayRemoveTransformOperation?__PRIVATE_arrayEquals(s.elements,o.elements,__PRIVATE_valueEquals):s instanceof __PRIVATE_NumericIncrementTransformOperation&&o instanceof __PRIVATE_NumericIncrementTransformOperation?__PRIVATE_valueEquals(s.Pe,o.Pe):s instanceof __PRIVATE_ServerTimestampTransform&&o instanceof __PRIVATE_ServerTimestampTransform);var s,o}(e,i)))&&(0===e.type?e.value.isEqual(i.value):1!==e.type||e.data.isEqual(i.data)&&e.fieldMask.isEqual(i.fieldMask)));var s,o}class __PRIVATE_SetMutation extends Mutation{constructor(e,i,s,o=[]){super(),this.key=e,this.value=i,this.precondition=s,this.fieldTransforms=o,this.type=0}getFieldMask(){return null}}class __PRIVATE_PatchMutation extends Mutation{constructor(e,i,s,o,l=[]){super(),this.key=e,this.data=i,this.fieldMask=s,this.precondition=o,this.fieldTransforms=l,this.type=1}getFieldMask(){return this.fieldMask}}function __PRIVATE_getPatch(e){const i=new Map;return e.fieldMask.fields.forEach(s=>{if(!s.isEmpty()){const o=e.data.field(s);i.set(s,o)}}),i}function __PRIVATE_serverTransformResults(e,i,s){const o=new Map;__PRIVATE_hardAssert(e.length===s.length);for(let l=0;l<s.length;l++){const h=e[l],d=h.transform,_=i.data.field(h.field);o.set(h.field,__PRIVATE_applyTransformOperationToRemoteDocument(d,_,s[l]))}return o}function __PRIVATE_localTransformResults(e,i,s){const o=new Map;for(const l of e){const e=l.transform,h=s.data.field(l.field);o.set(l.field,__PRIVATE_applyTransformOperationToLocalView(e,h,i))}return o}class __PRIVATE_DeleteMutation extends Mutation{constructor(e,i){super(),this.key=e,this.precondition=i,this.type=2,this.fieldTransforms=[]}getFieldMask(){return null}}class __PRIVATE_VerifyMutation extends Mutation{constructor(e,i){super(),this.key=e,this.precondition=i,this.type=3,this.fieldTransforms=[]}getFieldMask(){return null}}
/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class MutationBatch{constructor(e,i,s,o){this.batchId=e,this.localWriteTime=i,this.baseMutations=s,this.mutations=o}applyToRemoteDocument(e,i){const s=i.mutationResults;for(let o=0;o<this.mutations.length;o++){const i=this.mutations[o];i.key.isEqual(e.key)&&__PRIVATE_mutationApplyToRemoteDocument(i,e,s[o])}}applyToLocalView(e,i){for(const s of this.baseMutations)s.key.isEqual(e.key)&&(i=__PRIVATE_mutationApplyToLocalView(s,e,i,this.localWriteTime));for(const s of this.mutations)s.key.isEqual(e.key)&&(i=__PRIVATE_mutationApplyToLocalView(s,e,i,this.localWriteTime));return i}applyToLocalDocumentSet(e,i){const s=__PRIVATE_newMutationMap();return this.mutations.forEach(o=>{const l=e.get(o.key),h=l.overlayedDocument;let d=this.applyToLocalView(h,l.mutatedFields);d=i.has(o.key)?null:d;const _=__PRIVATE_calculateOverlayMutation(h,d);null!==_&&s.set(o.key,_),h.isValidDocument()||h.convertToNoDocument(SnapshotVersion.min())}),s}keys(){return this.mutations.reduce((e,i)=>e.add(i.key),__PRIVATE_documentKeySet())}isEqual(e){return this.batchId===e.batchId&&__PRIVATE_arrayEquals(this.mutations,e.mutations,(e,i)=>__PRIVATE_mutationEquals(e,i))&&__PRIVATE_arrayEquals(this.baseMutations,e.baseMutations,(e,i)=>__PRIVATE_mutationEquals(e,i))}}class MutationBatchResult{constructor(e,i,s,o){this.batch=e,this.commitVersion=i,this.mutationResults=s,this.docVersions=o}static from(e,i,s){__PRIVATE_hardAssert(e.mutations.length===s.length);let o=xt;const l=e.mutations;for(let h=0;h<l.length;h++)o=o.insert(l[h].key,s[h].version);return new MutationBatchResult(e,i,s,o)}}
/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Overlay{constructor(e,i){this.largestBatchId=e,this.mutation=i}getKey(){return this.mutation.key}isEqual(e){return null!==e&&this.mutation===e.mutation}toString(){return`Overlay{\n      largestBatchId: ${this.largestBatchId},\n      mutation: ${this.mutation.toString()}\n    }`}}
/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class ExistenceFilter{constructor(e,i){this.count=e,this.unchangedNames=i}}
/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */var jt,Kt;function __PRIVATE_mapCodeFromRpcCode(e){if(void 0===e)return __PRIVATE_logError("GRPC error has no .code"),Nt.UNKNOWN;switch(e){case jt.OK:return Nt.OK;case jt.CANCELLED:return Nt.CANCELLED;case jt.UNKNOWN:return Nt.UNKNOWN;case jt.DEADLINE_EXCEEDED:return Nt.DEADLINE_EXCEEDED;case jt.RESOURCE_EXHAUSTED:return Nt.RESOURCE_EXHAUSTED;case jt.INTERNAL:return Nt.INTERNAL;case jt.UNAVAILABLE:return Nt.UNAVAILABLE;case jt.UNAUTHENTICATED:return Nt.UNAUTHENTICATED;case jt.INVALID_ARGUMENT:return Nt.INVALID_ARGUMENT;case jt.NOT_FOUND:return Nt.NOT_FOUND;case jt.ALREADY_EXISTS:return Nt.ALREADY_EXISTS;case jt.PERMISSION_DENIED:return Nt.PERMISSION_DENIED;case jt.FAILED_PRECONDITION:return Nt.FAILED_PRECONDITION;case jt.ABORTED:return Nt.ABORTED;case jt.OUT_OF_RANGE:return Nt.OUT_OF_RANGE;case jt.UNIMPLEMENTED:return Nt.UNIMPLEMENTED;case jt.DATA_LOSS:return Nt.DATA_LOSS;default:return fail()}}(Kt=jt||(jt={}))[Kt.OK=0]="OK",Kt[Kt.CANCELLED=1]="CANCELLED",Kt[Kt.UNKNOWN=2]="UNKNOWN",Kt[Kt.INVALID_ARGUMENT=3]="INVALID_ARGUMENT",Kt[Kt.DEADLINE_EXCEEDED=4]="DEADLINE_EXCEEDED",Kt[Kt.NOT_FOUND=5]="NOT_FOUND",Kt[Kt.ALREADY_EXISTS=6]="ALREADY_EXISTS",Kt[Kt.PERMISSION_DENIED=7]="PERMISSION_DENIED",Kt[Kt.UNAUTHENTICATED=16]="UNAUTHENTICATED",Kt[Kt.RESOURCE_EXHAUSTED=8]="RESOURCE_EXHAUSTED",Kt[Kt.FAILED_PRECONDITION=9]="FAILED_PRECONDITION",Kt[Kt.ABORTED=10]="ABORTED",Kt[Kt.OUT_OF_RANGE=11]="OUT_OF_RANGE",Kt[Kt.UNIMPLEMENTED=12]="UNIMPLEMENTED",Kt[Kt.INTERNAL=13]="INTERNAL",Kt[Kt.UNAVAILABLE=14]="UNAVAILABLE",Kt[Kt.DATA_LOSS=15]="DATA_LOSS";
/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
const Wt=new Et([4294967295,4294967295],0);function __PRIVATE_getMd5HashValue(e){const i=(new TextEncoder).encode(e),s=new It;return s.update(i),new Uint8Array(s.digest())}function __PRIVATE_get64BitUints(e){const i=new DataView(e.buffer),s=i.getUint32(0,!0),o=i.getUint32(4,!0),l=i.getUint32(8,!0),h=i.getUint32(12,!0);return[new Et([s,o],0),new Et([l,h],0)]}class BloomFilter{constructor(e,i,s){if(this.bitmap=e,this.padding=i,this.hashCount=s,i<0||i>=8)throw new __PRIVATE_BloomFilterError(`Invalid padding: ${i}`);if(s<0)throw new __PRIVATE_BloomFilterError(`Invalid hash count: ${s}`);if(e.length>0&&0===this.hashCount)throw new __PRIVATE_BloomFilterError(`Invalid hash count: ${s}`);if(0===e.length&&0!==i)throw new __PRIVATE_BloomFilterError(`Invalid padding when bitmap length is 0: ${i}`);this.Ie=8*e.length-i,this.Te=Et.fromNumber(this.Ie)}Ee(e,i,s){let o=e.add(i.multiply(Et.fromNumber(s)));return 1===o.compare(Wt)&&(o=new Et([o.getBits(0),o.getBits(1)],0)),o.modulo(this.Te).toNumber()}de(e){return!!(this.bitmap[Math.floor(e/8)]&1<<e%8)}mightContain(e){if(0===this.Ie)return!1;const i=__PRIVATE_getMd5HashValue(e),[s,o]=__PRIVATE_get64BitUints(i);for(let l=0;l<this.hashCount;l++){const e=this.Ee(s,o,l);if(!this.de(e))return!1}return!0}static create(e,i,s){const o=e%8==0?0:8-e%8,l=new Uint8Array(Math.ceil(e/8)),h=new BloomFilter(l,o,i);return s.forEach(e=>h.insert(e)),h}insert(e){if(0===this.Ie)return;const i=__PRIVATE_getMd5HashValue(e),[s,o]=__PRIVATE_get64BitUints(i);for(let l=0;l<this.hashCount;l++){const e=this.Ee(s,o,l);this.Ae(e)}}Ae(e){const i=Math.floor(e/8),s=e%8;this.bitmap[i]|=1<<s}}class __PRIVATE_BloomFilterError extends Error{constructor(){super(...arguments),this.name="BloomFilterError"}}
/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class RemoteEvent{constructor(e,i,s,o,l){this.snapshotVersion=e,this.targetChanges=i,this.targetMismatches=s,this.documentUpdates=o,this.resolvedLimboDocuments=l}static createSynthesizedRemoteEventForCurrentChange(e,i,s){const o=new Map;return o.set(e,TargetChange.createSynthesizedTargetChangeForCurrentChange(e,i,s)),new RemoteEvent(SnapshotVersion.min(),o,new SortedMap(__PRIVATE_primitiveComparator),__PRIVATE_mutableDocumentMap(),__PRIVATE_documentKeySet())}}class TargetChange{constructor(e,i,s,o,l){this.resumeToken=e,this.current=i,this.addedDocuments=s,this.modifiedDocuments=o,this.removedDocuments=l}static createSynthesizedTargetChangeForCurrentChange(e,i,s){return new TargetChange(s,i,__PRIVATE_documentKeySet(),__PRIVATE_documentKeySet(),__PRIVATE_documentKeySet())}}
/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class __PRIVATE_DocumentWatchChange{constructor(e,i,s,o){this.Re=e,this.removedTargetIds=i,this.key=s,this.Ve=o}}class __PRIVATE_ExistenceFilterChange{constructor(e,i){this.targetId=e,this.me=i}}class __PRIVATE_WatchTargetChange{constructor(e,i,s=ByteString.EMPTY_BYTE_STRING,o=null){this.state=e,this.targetIds=i,this.resumeToken=s,this.cause=o}}class __PRIVATE_TargetState{constructor(){this.fe=0,this.ge=__PRIVATE_snapshotChangesMap(),this.pe=ByteString.EMPTY_BYTE_STRING,this.ye=!1,this.we=!0}get current(){return this.ye}get resumeToken(){return this.pe}get Se(){return 0!==this.fe}get be(){return this.we}De(e){e.approximateByteSize()>0&&(this.we=!0,this.pe=e)}ve(){let e=__PRIVATE_documentKeySet(),i=__PRIVATE_documentKeySet(),s=__PRIVATE_documentKeySet();return this.ge.forEach((o,l)=>{switch(l){case 0:e=e.add(o);break;case 2:i=i.add(o);break;case 1:s=s.add(o);break;default:fail()}}),new TargetChange(this.pe,this.ye,e,i,s)}Ce(){this.we=!1,this.ge=__PRIVATE_snapshotChangesMap()}Fe(e,i){this.we=!0,this.ge=this.ge.insert(e,i)}Me(e){this.we=!0,this.ge=this.ge.remove(e)}xe(){this.fe+=1}Oe(){this.fe-=1,__PRIVATE_hardAssert(this.fe>=0)}Ne(){this.we=!0,this.ye=!0}}class __PRIVATE_WatchChangeAggregator{constructor(e){this.Le=e,this.Be=new Map,this.ke=__PRIVATE_mutableDocumentMap(),this.qe=__PRIVATE_documentTargetMap(),this.Qe=new SortedMap(__PRIVATE_primitiveComparator)}Ke(e){for(const i of e.Re)e.Ve&&e.Ve.isFoundDocument()?this.$e(i,e.Ve):this.Ue(i,e.key,e.Ve);for(const i of e.removedTargetIds)this.Ue(i,e.key,e.Ve)}We(e){this.forEachTarget(e,i=>{const s=this.Ge(i);switch(e.state){case 0:this.ze(i)&&s.De(e.resumeToken);break;case 1:s.Oe(),s.Se||s.Ce(),s.De(e.resumeToken);break;case 2:s.Oe(),s.Se||this.removeTarget(i);break;case 3:this.ze(i)&&(s.Ne(),s.De(e.resumeToken));break;case 4:this.ze(i)&&(this.je(i),s.De(e.resumeToken));break;default:fail()}})}forEachTarget(e,i){e.targetIds.length>0?e.targetIds.forEach(i):this.Be.forEach((e,s)=>{this.ze(s)&&i(s)})}He(e){const i=e.targetId,s=e.me.count,o=this.Je(i);if(o){const l=o.target;if(__PRIVATE_targetIsDocumentTarget(l))if(0===s){const e=new DocumentKey(l.path);this.Ue(i,e,MutableDocument.newNoDocument(e,SnapshotVersion.min()))}else __PRIVATE_hardAssert(1===s);else{const o=this.Ye(i);if(o!==s){const s=this.Ze(e),l=s?this.Xe(s,e,o):1;if(0!==l){this.je(i);const e=2===l?"TargetPurposeExistenceFilterMismatchBloom":"TargetPurposeExistenceFilterMismatch";this.Qe=this.Qe.insert(i,e)}}}}}Ze(e){const i=e.me.unchangedNames;if(!i||!i.bits)return null;const{bits:{bitmap:s="",padding:o=0},hashCount:l=0}=i;let h,d;try{h=__PRIVATE_normalizeByteString(s).toUint8Array()}catch(_){if(_ instanceof __PRIVATE_Base64DecodeError)return __PRIVATE_logWarn("Decoding the base64 bloom filter in existence filter failed ("+_.message+"); ignoring the bloom filter and falling back to full re-query."),null;throw _}try{d=new BloomFilter(h,o,l)}catch(_){return __PRIVATE_logWarn(_ instanceof __PRIVATE_BloomFilterError?"BloomFilter error: ":"Applying bloom filter failed: ",_),null}return 0===d.Ie?null:d}Xe(e,i,s){return i.me.count===s-this.nt(e,i.targetId)?0:2}nt(e,i){const s=this.Le.getRemoteKeysForTarget(i);let o=0;return s.forEach(s=>{const l=this.Le.tt(),h=`projects/${l.projectId}/databases/${l.database}/documents/${s.path.canonicalString()}`;e.mightContain(h)||(this.Ue(i,s,null),o++)}),o}rt(e){const i=new Map;this.Be.forEach((s,o)=>{const l=this.Je(o);if(l){if(s.current&&__PRIVATE_targetIsDocumentTarget(l.target)){const i=new DocumentKey(l.target.path);null!==this.ke.get(i)||this.it(o,i)||this.Ue(o,i,MutableDocument.newNoDocument(i,e))}s.be&&(i.set(o,s.ve()),s.Ce())}});let s=__PRIVATE_documentKeySet();this.qe.forEach((e,i)=>{let o=!0;i.forEachWhile(e=>{const i=this.Je(e);return!i||"TargetPurposeLimboResolution"===i.purpose||(o=!1,!1)}),o&&(s=s.add(e))}),this.ke.forEach((i,s)=>s.setReadTime(e));const o=new RemoteEvent(e,i,this.Qe,this.ke,s);return this.ke=__PRIVATE_mutableDocumentMap(),this.qe=__PRIVATE_documentTargetMap(),this.Qe=new SortedMap(__PRIVATE_primitiveComparator),o}$e(e,i){if(!this.ze(e))return;const s=this.it(e,i.key)?2:0;this.Ge(e).Fe(i.key,s),this.ke=this.ke.insert(i.key,i),this.qe=this.qe.insert(i.key,this.st(i.key).add(e))}Ue(e,i,s){if(!this.ze(e))return;const o=this.Ge(e);this.it(e,i)?o.Fe(i,1):o.Me(i),this.qe=this.qe.insert(i,this.st(i).delete(e)),s&&(this.ke=this.ke.insert(i,s))}removeTarget(e){this.Be.delete(e)}Ye(e){const i=this.Ge(e).ve();return this.Le.getRemoteKeysForTarget(e).size+i.addedDocuments.size-i.removedDocuments.size}xe(e){this.Ge(e).xe()}Ge(e){let i=this.Be.get(e);return i||(i=new __PRIVATE_TargetState,this.Be.set(e,i)),i}st(e){let i=this.qe.get(e);return i||(i=new SortedSet(__PRIVATE_primitiveComparator),this.qe=this.qe.insert(e,i)),i}ze(e){const i=null!==this.Je(e);return i||__PRIVATE_logDebug("WatchChangeAggregator","Detected inactive target",e),i}Je(e){const i=this.Be.get(e);return i&&i.Se?null:this.Le.ot(e)}je(e){this.Be.set(e,new __PRIVATE_TargetState),this.Le.getRemoteKeysForTarget(e).forEach(i=>{this.Ue(e,i,null)})}it(e,i){return this.Le.getRemoteKeysForTarget(e).has(i)}}function __PRIVATE_documentTargetMap(){return new SortedMap(DocumentKey.comparator)}function __PRIVATE_snapshotChangesMap(){return new SortedMap(DocumentKey.comparator)}const zt={asc:"ASCENDING",desc:"DESCENDING"},$t={"<":"LESS_THAN","<=":"LESS_THAN_OR_EQUAL",">":"GREATER_THAN",">=":"GREATER_THAN_OR_EQUAL","==":"EQUAL","!=":"NOT_EQUAL","array-contains":"ARRAY_CONTAINS",in:"IN","not-in":"NOT_IN","array-contains-any":"ARRAY_CONTAINS_ANY"},Gt={and:"AND",or:"OR"};class JsonProtoSerializer{constructor(e,i){this.databaseId=e,this.useProto3Json=i}}function __PRIVATE_toInt32Proto(e,i){return e.useProto3Json||__PRIVATE_isNullOrUndefined(i)?i:{value:i}}function toTimestamp(e,i){return e.useProto3Json?`${new Date(1e3*i.seconds).toISOString().replace(/\.\d*/,"").replace("Z","")}.${("000000000"+i.nanoseconds).slice(-9)}Z`:{seconds:""+i.seconds,nanos:i.nanoseconds}}function __PRIVATE_toBytes(e,i){return e.useProto3Json?i.toBase64():i.toUint8Array()}function __PRIVATE_toVersion(e,i){return toTimestamp(e,i.toTimestamp())}function __PRIVATE_fromVersion(e){return __PRIVATE_hardAssert(!!e),SnapshotVersion.fromTimestamp(function(e){const i=__PRIVATE_normalizeTimestamp(e);return new Timestamp(i.seconds,i.nanos)}(e))}function __PRIVATE_toResourceName(e,i){return __PRIVATE_toResourcePath(e,i).canonicalString()}function __PRIVATE_toResourcePath(e,i){const s=(o=e,new ResourcePath(["projects",o.projectId,"databases",o.database])).child("documents");var o;return void 0===i?s:s.child(i)}function __PRIVATE_fromResourceName(e){const i=ResourcePath.fromString(e);return __PRIVATE_hardAssert(__PRIVATE_isValidResourceName(i)),i}function __PRIVATE_toName(e,i){return __PRIVATE_toResourceName(e.databaseId,i.path)}function fromName(e,i){const s=__PRIVATE_fromResourceName(i);if(s.get(1)!==e.databaseId.projectId)throw new FirestoreError(Nt.INVALID_ARGUMENT,"Tried to deserialize key from different project: "+s.get(1)+" vs "+e.databaseId.projectId);if(s.get(3)!==e.databaseId.database)throw new FirestoreError(Nt.INVALID_ARGUMENT,"Tried to deserialize key from different database: "+s.get(3)+" vs "+e.databaseId.database);return new DocumentKey(__PRIVATE_extractLocalPathFromResourceName(s))}function __PRIVATE_toQueryPath(e,i){return __PRIVATE_toResourceName(e.databaseId,i)}function __PRIVATE_getEncodedDatabaseId(e){return new ResourcePath(["projects",e.databaseId.projectId,"databases",e.databaseId.database]).canonicalString()}function __PRIVATE_extractLocalPathFromResourceName(e){return __PRIVATE_hardAssert(e.length>4&&"documents"===e.get(4)),e.popFirst(5)}function __PRIVATE_toMutationDocument(e,i,s){return{name:__PRIVATE_toName(e,i),fields:s.value.mapValue.fields}}function __PRIVATE_toDocumentsTarget(e,i){return{documents:[__PRIVATE_toQueryPath(e,i.path)]}}function __PRIVATE_toQueryTarget(e,i){const s={structuredQuery:{}},o=i.path;let l;null!==i.collectionGroup?(l=o,s.structuredQuery.from=[{collectionId:i.collectionGroup,allDescendants:!0}]):(l=o.popLast(),s.structuredQuery.from=[{collectionId:o.lastSegment()}]),s.parent=__PRIVATE_toQueryPath(e,l);const h=function(e){if(0!==e.length)return __PRIVATE_toFilter(CompositeFilter.create(e,"and"))}(i.filters);h&&(s.structuredQuery.where=h);const d=function(e){if(0!==e.length)return e.map(e=>{return{field:__PRIVATE_toFieldPathReference((i=e).field),direction:__PRIVATE_toDirection(i.dir)};var i})}(i.orderBy);d&&(s.structuredQuery.orderBy=d);const _=__PRIVATE_toInt32Proto(e,i.limit);return null!==_&&(s.structuredQuery.limit=_),i.startAt&&(s.structuredQuery.startAt={before:(f=i.startAt).inclusive,values:f.position}),i.endAt&&(s.structuredQuery.endAt=function(e){return{before:!e.inclusive,values:e.position}}(i.endAt)),{_t:s,parent:l};var f}function __PRIVATE_convertQueryTargetToQuery(e){let i=function(e){const i=__PRIVATE_fromResourceName(e);return 4===i.length?ResourcePath.emptyPath():__PRIVATE_extractLocalPathFromResourceName(i)}(e.parent);const s=e.structuredQuery,o=s.from?s.from.length:0;let l=null;if(o>0){__PRIVATE_hardAssert(1===o);const e=s.from[0];e.allDescendants?l=e.collectionId:i=i.child(e.collectionId)}let h=[];s.where&&(h=function(e){const i=__PRIVATE_fromFilter(e);return i instanceof CompositeFilter&&__PRIVATE_compositeFilterIsFlatConjunction(i)?i.getFilters():[i]}(s.where));let d=[];s.orderBy&&(d=s.orderBy.map(e=>{return new OrderBy(__PRIVATE_fromFieldPathReference((i=e).field),function(e){switch(e){case"ASCENDING":return"asc";case"DESCENDING":return"desc";default:return}}(i.direction));var i}));let _=null;s.limit&&(_=function(e){let i;return i="object"==typeof e?e.value:e,__PRIVATE_isNullOrUndefined(i)?null:i}(s.limit));let f=null;s.startAt&&(f=function(e){const i=!!e.before,s=e.values||[];return new Bound(s,i)}(s.startAt));let g=null;return s.endAt&&(g=function(e){const i=!e.before,s=e.values||[];return new Bound(s,i)}(s.endAt)),function(e,i,s,o,l,h,d,_){return new __PRIVATE_QueryImpl(e,i,s,o,l,h,d,_)}(i,l,d,h,_,"F",f,g)}function __PRIVATE_fromFilter(e){return void 0!==e.unaryFilter?function(e){switch(e.unaryFilter.op){case"IS_NAN":const i=__PRIVATE_fromFieldPathReference(e.unaryFilter.field);return FieldFilter.create(i,"==",{doubleValue:NaN});case"IS_NULL":const s=__PRIVATE_fromFieldPathReference(e.unaryFilter.field);return FieldFilter.create(s,"==",{nullValue:"NULL_VALUE"});case"IS_NOT_NAN":const o=__PRIVATE_fromFieldPathReference(e.unaryFilter.field);return FieldFilter.create(o,"!=",{doubleValue:NaN});case"IS_NOT_NULL":const l=__PRIVATE_fromFieldPathReference(e.unaryFilter.field);return FieldFilter.create(l,"!=",{nullValue:"NULL_VALUE"});default:return fail()}}(e):void 0!==e.fieldFilter?(i=e,FieldFilter.create(__PRIVATE_fromFieldPathReference(i.fieldFilter.field),function(e){switch(e){case"EQUAL":return"==";case"NOT_EQUAL":return"!=";case"GREATER_THAN":return">";case"GREATER_THAN_OR_EQUAL":return">=";case"LESS_THAN":return"<";case"LESS_THAN_OR_EQUAL":return"<=";case"ARRAY_CONTAINS":return"array-contains";case"IN":return"in";case"NOT_IN":return"not-in";case"ARRAY_CONTAINS_ANY":return"array-contains-any";default:return fail()}}(i.fieldFilter.op),i.fieldFilter.value)):void 0!==e.compositeFilter?function(e){return CompositeFilter.create(e.compositeFilter.filters.map(e=>__PRIVATE_fromFilter(e)),function(e){switch(e){case"AND":return"and";case"OR":return"or";default:return fail()}}(e.compositeFilter.op))}(e):fail();var i}function __PRIVATE_toDirection(e){return zt[e]}function __PRIVATE_toOperatorName(e){return $t[e]}function __PRIVATE_toCompositeOperatorName(e){return Gt[e]}function __PRIVATE_toFieldPathReference(e){return{fieldPath:e.canonicalString()}}function __PRIVATE_fromFieldPathReference(e){return FieldPath$1.fromServerFormat(e.fieldPath)}function __PRIVATE_toFilter(e){return e instanceof FieldFilter?function(e){if("=="===e.op){if(__PRIVATE_isNanValue(e.value))return{unaryFilter:{field:__PRIVATE_toFieldPathReference(e.field),op:"IS_NAN"}};if(__PRIVATE_isNullValue(e.value))return{unaryFilter:{field:__PRIVATE_toFieldPathReference(e.field),op:"IS_NULL"}}}else if("!="===e.op){if(__PRIVATE_isNanValue(e.value))return{unaryFilter:{field:__PRIVATE_toFieldPathReference(e.field),op:"IS_NOT_NAN"}};if(__PRIVATE_isNullValue(e.value))return{unaryFilter:{field:__PRIVATE_toFieldPathReference(e.field),op:"IS_NOT_NULL"}}}return{fieldFilter:{field:__PRIVATE_toFieldPathReference(e.field),op:__PRIVATE_toOperatorName(e.op),value:e.value}}}(e):e instanceof CompositeFilter?function(e){const i=e.getFilters().map(e=>__PRIVATE_toFilter(e));return 1===i.length?i[0]:{compositeFilter:{op:__PRIVATE_toCompositeOperatorName(e.op),filters:i}}}(e):fail()}function __PRIVATE_toDocumentMask(e){const i=[];return e.fields.forEach(e=>i.push(e.canonicalString())),{fieldPaths:i}}function __PRIVATE_isValidResourceName(e){return e.length>=4&&"projects"===e.get(0)&&"databases"===e.get(2)}
/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class TargetData{constructor(e,i,s,o,l=SnapshotVersion.min(),h=SnapshotVersion.min(),d=ByteString.EMPTY_BYTE_STRING,_=null){this.target=e,this.targetId=i,this.purpose=s,this.sequenceNumber=o,this.snapshotVersion=l,this.lastLimboFreeSnapshotVersion=h,this.resumeToken=d,this.expectedCount=_}withSequenceNumber(e){return new TargetData(this.target,this.targetId,this.purpose,e,this.snapshotVersion,this.lastLimboFreeSnapshotVersion,this.resumeToken,this.expectedCount)}withResumeToken(e,i){return new TargetData(this.target,this.targetId,this.purpose,this.sequenceNumber,i,this.lastLimboFreeSnapshotVersion,e,null)}withExpectedCount(e){return new TargetData(this.target,this.targetId,this.purpose,this.sequenceNumber,this.snapshotVersion,this.lastLimboFreeSnapshotVersion,this.resumeToken,e)}withLastLimboFreeSnapshotVersion(e){return new TargetData(this.target,this.targetId,this.purpose,this.sequenceNumber,this.snapshotVersion,e,this.resumeToken,this.expectedCount)}}
/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class __PRIVATE_LocalSerializer{constructor(e){this.ct=e}}function __PRIVATE_fromBundledQuery(e){const i=__PRIVATE_convertQueryTargetToQuery({parent:e.parent,structuredQuery:e.structuredQuery});return"LAST"===e.limitType?__PRIVATE_queryWithLimit(i,i.limit,"L"):i}
/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class __PRIVATE_MemoryIndexManager{constructor(){this.un=new __PRIVATE_MemoryCollectionParentIndex}addToCollectionParentIndex(e,i){return this.un.add(i),PersistencePromise.resolve()}getCollectionParents(e,i){return PersistencePromise.resolve(this.un.getEntries(i))}addFieldIndex(e,i){return PersistencePromise.resolve()}deleteFieldIndex(e,i){return PersistencePromise.resolve()}deleteAllFieldIndexes(e){return PersistencePromise.resolve()}createTargetIndexes(e,i){return PersistencePromise.resolve()}getDocumentsMatchingTarget(e,i){return PersistencePromise.resolve(null)}getIndexType(e,i){return PersistencePromise.resolve(0)}getFieldIndexes(e,i){return PersistencePromise.resolve([])}getNextCollectionGroupToUpdate(e){return PersistencePromise.resolve(null)}getMinOffset(e,i){return PersistencePromise.resolve(IndexOffset.min())}getMinOffsetFromCollectionGroup(e,i){return PersistencePromise.resolve(IndexOffset.min())}updateCollectionGroup(e,i,s){return PersistencePromise.resolve()}updateIndexEntries(e,i){return PersistencePromise.resolve()}}class __PRIVATE_MemoryCollectionParentIndex{constructor(){this.index={}}add(e){const i=e.lastSegment(),s=e.popLast(),o=this.index[i]||new SortedSet(ResourcePath.comparator),l=!o.has(s);return this.index[i]=o.add(s),l}has(e){const i=e.lastSegment(),s=e.popLast(),o=this.index[i];return o&&o.has(s)}getEntries(e){return(this.index[e]||new SortedSet(ResourcePath.comparator)).toArray()}}
/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class __PRIVATE_TargetIdGenerator{constructor(e){this.Ln=e}next(){return this.Ln+=2,this.Ln}static Bn(){return new __PRIVATE_TargetIdGenerator(0)}static kn(){return new __PRIVATE_TargetIdGenerator(-1)}}
/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class RemoteDocumentChangeBuffer{constructor(){this.changes=new ObjectMap(e=>e.toString(),(e,i)=>e.isEqual(i)),this.changesApplied=!1}addEntry(e){this.assertNotApplied(),this.changes.set(e.key,e)}removeEntry(e,i){this.assertNotApplied(),this.changes.set(e,MutableDocument.newInvalidDocument(e).setReadTime(i))}getEntry(e,i){this.assertNotApplied();const s=this.changes.get(i);return void 0!==s?PersistencePromise.resolve(s):this.getFromCache(e,i)}getEntries(e,i){return this.getAllFromCache(e,i)}apply(e){return this.assertNotApplied(),this.changesApplied=!0,this.applyChanges(e)}assertNotApplied(){}}
/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class OverlayedDocument{constructor(e,i){this.overlayedDocument=e,this.mutatedFields=i}}
/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class LocalDocumentsView{constructor(e,i,s,o){this.remoteDocumentCache=e,this.mutationQueue=i,this.documentOverlayCache=s,this.indexManager=o}getDocument(e,i){let s=null;return this.documentOverlayCache.getOverlay(e,i).next(o=>(s=o,this.remoteDocumentCache.getEntry(e,i))).next(e=>(null!==s&&__PRIVATE_mutationApplyToLocalView(s.mutation,e,FieldMask.empty(),Timestamp.now()),e))}getDocuments(e,i){return this.remoteDocumentCache.getEntries(e,i).next(i=>this.getLocalViewOfDocuments(e,i,__PRIVATE_documentKeySet()).next(()=>i))}getLocalViewOfDocuments(e,i,s=__PRIVATE_documentKeySet()){const o=__PRIVATE_newOverlayMap();return this.populateOverlays(e,o,i).next(()=>this.computeViews(e,i,o,s).next(e=>{let i=documentMap();return e.forEach((e,s)=>{i=i.insert(e,s.overlayedDocument)}),i}))}getOverlayedDocuments(e,i){const s=__PRIVATE_newOverlayMap();return this.populateOverlays(e,s,i).next(()=>this.computeViews(e,i,s,__PRIVATE_documentKeySet()))}populateOverlays(e,i,s){const o=[];return s.forEach(e=>{i.has(e)||o.push(e)}),this.documentOverlayCache.getOverlays(e,o).next(e=>{e.forEach((e,s)=>{i.set(e,s)})})}computeViews(e,i,s,o){let l=__PRIVATE_mutableDocumentMap();const h=__PRIVATE_newDocumentKeyMap(),d=__PRIVATE_newDocumentKeyMap();return i.forEach((e,i)=>{const d=s.get(i.key);o.has(i.key)&&(void 0===d||d.mutation instanceof __PRIVATE_PatchMutation)?l=l.insert(i.key,i):void 0!==d?(h.set(i.key,d.mutation.getFieldMask()),__PRIVATE_mutationApplyToLocalView(d.mutation,i,d.mutation.getFieldMask(),Timestamp.now())):h.set(i.key,FieldMask.empty())}),this.recalculateAndSaveOverlays(e,l).next(e=>(e.forEach((e,i)=>h.set(e,i)),i.forEach((e,i)=>{var s;return d.set(e,new OverlayedDocument(i,null!==(s=h.get(e))&&void 0!==s?s:null))}),d))}recalculateAndSaveOverlays(e,i){const s=__PRIVATE_newDocumentKeyMap();let o=new SortedMap((e,i)=>e-i),l=__PRIVATE_documentKeySet();return this.mutationQueue.getAllMutationBatchesAffectingDocumentKeys(e,i).next(e=>{for(const l of e)l.keys().forEach(e=>{const h=i.get(e);if(null===h)return;let d=s.get(e)||FieldMask.empty();d=l.applyToLocalView(h,d),s.set(e,d);const _=(o.get(l.batchId)||__PRIVATE_documentKeySet()).add(e);o=o.insert(l.batchId,_)})}).next(()=>{const h=[],d=o.getReverseIterator();for(;d.hasNext();){const o=d.getNext(),_=o.key,f=o.value,g=__PRIVATE_newMutationMap();f.forEach(e=>{if(!l.has(e)){const o=__PRIVATE_calculateOverlayMutation(i.get(e),s.get(e));null!==o&&g.set(e,o),l=l.add(e)}}),h.push(this.documentOverlayCache.saveOverlays(e,_,g))}return PersistencePromise.waitFor(h)}).next(()=>s)}recalculateAndSaveOverlaysForDocumentKeys(e,i){return this.remoteDocumentCache.getEntries(e,i).next(i=>this.recalculateAndSaveOverlays(e,i))}getDocumentsMatchingQuery(e,i,s,o){return l=i,DocumentKey.isDocumentKey(l.path)&&null===l.collectionGroup&&0===l.filters.length?this.getDocumentsMatchingDocumentQuery(e,i.path):__PRIVATE_isCollectionGroupQuery(i)?this.getDocumentsMatchingCollectionGroupQuery(e,i,s,o):this.getDocumentsMatchingCollectionQuery(e,i,s,o);var l}getNextDocuments(e,i,s,o){return this.remoteDocumentCache.getAllFromCollectionGroup(e,i,s,o).next(l=>{const h=o-l.size>0?this.documentOverlayCache.getOverlaysForCollectionGroup(e,i,s.largestBatchId,o-l.size):PersistencePromise.resolve(__PRIVATE_newOverlayMap());let d=-1,_=l;return h.next(i=>PersistencePromise.forEach(i,(i,s)=>(d<s.largestBatchId&&(d=s.largestBatchId),l.get(i)?PersistencePromise.resolve():this.remoteDocumentCache.getEntry(e,i).next(e=>{_=_.insert(i,e)}))).next(()=>this.populateOverlays(e,i,l)).next(()=>this.computeViews(e,_,i,__PRIVATE_documentKeySet())).next(e=>({batchId:d,changes:__PRIVATE_convertOverlayedDocumentMapToDocumentMap(e)})))})}getDocumentsMatchingDocumentQuery(e,i){return this.getDocument(e,new DocumentKey(i)).next(e=>{let i=documentMap();return e.isFoundDocument()&&(i=i.insert(e.key,e)),i})}getDocumentsMatchingCollectionGroupQuery(e,i,s,o){const l=i.collectionGroup;let h=documentMap();return this.indexManager.getCollectionParents(e,l).next(d=>PersistencePromise.forEach(d,d=>{const _=(f=i,g=d.child(l),new __PRIVATE_QueryImpl(g,null,f.explicitOrderBy.slice(),f.filters.slice(),f.limit,f.limitType,f.startAt,f.endAt));var f,g;return this.getDocumentsMatchingCollectionQuery(e,_,s,o).next(e=>{e.forEach((e,i)=>{h=h.insert(e,i)})})}).next(()=>h))}getDocumentsMatchingCollectionQuery(e,i,s,o){let l;return this.documentOverlayCache.getOverlaysForCollection(e,i.path,s.largestBatchId).next(h=>(l=h,this.remoteDocumentCache.getDocumentsMatchingQuery(e,i,s,l,o))).next(e=>{l.forEach((i,s)=>{const o=s.getKey();null===e.get(o)&&(e=e.insert(o,MutableDocument.newInvalidDocument(o)))});let s=documentMap();return e.forEach((e,o)=>{const h=l.get(e);void 0!==h&&__PRIVATE_mutationApplyToLocalView(h.mutation,o,FieldMask.empty(),Timestamp.now()),__PRIVATE_queryMatches(i,o)&&(s=s.insert(e,o))}),s})}}
/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class __PRIVATE_MemoryBundleCache{constructor(e){this.serializer=e,this.hr=new Map,this.Pr=new Map}getBundleMetadata(e,i){return PersistencePromise.resolve(this.hr.get(i))}saveBundleMetadata(e,i){return this.hr.set(i.id,{id:(s=i).id,version:s.version,createTime:__PRIVATE_fromVersion(s.createTime)}),PersistencePromise.resolve();var s}getNamedQuery(e,i){return PersistencePromise.resolve(this.Pr.get(i))}saveNamedQuery(e,i){return this.Pr.set(i.name,{name:(s=i).name,query:__PRIVATE_fromBundledQuery(s.bundledQuery),readTime:__PRIVATE_fromVersion(s.readTime)}),PersistencePromise.resolve();var s}}
/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class __PRIVATE_MemoryDocumentOverlayCache{constructor(){this.overlays=new SortedMap(DocumentKey.comparator),this.Ir=new Map}getOverlay(e,i){return PersistencePromise.resolve(this.overlays.get(i))}getOverlays(e,i){const s=__PRIVATE_newOverlayMap();return PersistencePromise.forEach(i,i=>this.getOverlay(e,i).next(e=>{null!==e&&s.set(i,e)})).next(()=>s)}saveOverlays(e,i,s){return s.forEach((s,o)=>{this.ht(e,i,o)}),PersistencePromise.resolve()}removeOverlaysForBatchId(e,i,s){const o=this.Ir.get(s);return void 0!==o&&(o.forEach(e=>this.overlays=this.overlays.remove(e)),this.Ir.delete(s)),PersistencePromise.resolve()}getOverlaysForCollection(e,i,s){const o=__PRIVATE_newOverlayMap(),l=i.length+1,h=new DocumentKey(i.child("")),d=this.overlays.getIteratorFrom(h);for(;d.hasNext();){const e=d.getNext().value,h=e.getKey();if(!i.isPrefixOf(h.path))break;h.path.length===l&&e.largestBatchId>s&&o.set(e.getKey(),e)}return PersistencePromise.resolve(o)}getOverlaysForCollectionGroup(e,i,s,o){let l=new SortedMap((e,i)=>e-i);const h=this.overlays.getIterator();for(;h.hasNext();){const e=h.getNext().value;if(e.getKey().getCollectionGroup()===i&&e.largestBatchId>s){let i=l.get(e.largestBatchId);null===i&&(i=__PRIVATE_newOverlayMap(),l=l.insert(e.largestBatchId,i)),i.set(e.getKey(),e)}}const d=__PRIVATE_newOverlayMap(),_=l.getIterator();for(;_.hasNext()&&(_.getNext().value.forEach((e,i)=>d.set(e,i)),!(d.size()>=o)););return PersistencePromise.resolve(d)}ht(e,i,s){const o=this.overlays.get(s.key);if(null!==o){const e=this.Ir.get(o.largestBatchId).delete(s.key);this.Ir.set(o.largestBatchId,e)}this.overlays=this.overlays.insert(s.key,new Overlay(i,s));let l=this.Ir.get(i);void 0===l&&(l=__PRIVATE_documentKeySet(),this.Ir.set(i,l)),this.Ir.set(i,l.add(s.key))}}
/**
 * @license
 * Copyright 2024 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class __PRIVATE_MemoryGlobalsCache{constructor(){this.sessionToken=ByteString.EMPTY_BYTE_STRING}getSessionToken(e){return PersistencePromise.resolve(this.sessionToken)}setSessionToken(e,i){return this.sessionToken=i,PersistencePromise.resolve()}}
/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class __PRIVATE_ReferenceSet{constructor(){this.Tr=new SortedSet(__PRIVATE_DocReference.Er),this.dr=new SortedSet(__PRIVATE_DocReference.Ar)}isEmpty(){return this.Tr.isEmpty()}addReference(e,i){const s=new __PRIVATE_DocReference(e,i);this.Tr=this.Tr.add(s),this.dr=this.dr.add(s)}Rr(e,i){e.forEach(e=>this.addReference(e,i))}removeReference(e,i){this.Vr(new __PRIVATE_DocReference(e,i))}mr(e,i){e.forEach(e=>this.removeReference(e,i))}gr(e){const i=new DocumentKey(new ResourcePath([])),s=new __PRIVATE_DocReference(i,e),o=new __PRIVATE_DocReference(i,e+1),l=[];return this.dr.forEachInRange([s,o],e=>{this.Vr(e),l.push(e.key)}),l}pr(){this.Tr.forEach(e=>this.Vr(e))}Vr(e){this.Tr=this.Tr.delete(e),this.dr=this.dr.delete(e)}yr(e){const i=new DocumentKey(new ResourcePath([])),s=new __PRIVATE_DocReference(i,e),o=new __PRIVATE_DocReference(i,e+1);let l=__PRIVATE_documentKeySet();return this.dr.forEachInRange([s,o],e=>{l=l.add(e.key)}),l}containsKey(e){const i=new __PRIVATE_DocReference(e,0),s=this.Tr.firstAfterOrEqual(i);return null!==s&&e.isEqual(s.key)}}class __PRIVATE_DocReference{constructor(e,i){this.key=e,this.wr=i}static Er(e,i){return DocumentKey.comparator(e.key,i.key)||__PRIVATE_primitiveComparator(e.wr,i.wr)}static Ar(e,i){return __PRIVATE_primitiveComparator(e.wr,i.wr)||DocumentKey.comparator(e.key,i.key)}}
/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class __PRIVATE_MemoryMutationQueue{constructor(e,i){this.indexManager=e,this.referenceDelegate=i,this.mutationQueue=[],this.Sr=1,this.br=new SortedSet(__PRIVATE_DocReference.Er)}checkEmpty(e){return PersistencePromise.resolve(0===this.mutationQueue.length)}addMutationBatch(e,i,s,o){const l=this.Sr;this.Sr++,this.mutationQueue.length>0&&this.mutationQueue[this.mutationQueue.length-1];const h=new MutationBatch(l,i,s,o);this.mutationQueue.push(h);for(const d of o)this.br=this.br.add(new __PRIVATE_DocReference(d.key,l)),this.indexManager.addToCollectionParentIndex(e,d.key.path.popLast());return PersistencePromise.resolve(h)}lookupMutationBatch(e,i){return PersistencePromise.resolve(this.Dr(i))}getNextMutationBatchAfterBatchId(e,i){const s=i+1,o=this.vr(s),l=o<0?0:o;return PersistencePromise.resolve(this.mutationQueue.length>l?this.mutationQueue[l]:null)}getHighestUnacknowledgedBatchId(){return PersistencePromise.resolve(0===this.mutationQueue.length?-1:this.Sr-1)}getAllMutationBatches(e){return PersistencePromise.resolve(this.mutationQueue.slice())}getAllMutationBatchesAffectingDocumentKey(e,i){const s=new __PRIVATE_DocReference(i,0),o=new __PRIVATE_DocReference(i,Number.POSITIVE_INFINITY),l=[];return this.br.forEachInRange([s,o],e=>{const i=this.Dr(e.wr);l.push(i)}),PersistencePromise.resolve(l)}getAllMutationBatchesAffectingDocumentKeys(e,i){let s=new SortedSet(__PRIVATE_primitiveComparator);return i.forEach(e=>{const i=new __PRIVATE_DocReference(e,0),o=new __PRIVATE_DocReference(e,Number.POSITIVE_INFINITY);this.br.forEachInRange([i,o],e=>{s=s.add(e.wr)})}),PersistencePromise.resolve(this.Cr(s))}getAllMutationBatchesAffectingQuery(e,i){const s=i.path,o=s.length+1;let l=s;DocumentKey.isDocumentKey(l)||(l=l.child(""));const h=new __PRIVATE_DocReference(new DocumentKey(l),0);let d=new SortedSet(__PRIVATE_primitiveComparator);return this.br.forEachWhile(e=>{const i=e.key.path;return!!s.isPrefixOf(i)&&(i.length===o&&(d=d.add(e.wr)),!0)},h),PersistencePromise.resolve(this.Cr(d))}Cr(e){const i=[];return e.forEach(e=>{const s=this.Dr(e);null!==s&&i.push(s)}),i}removeMutationBatch(e,i){__PRIVATE_hardAssert(0===this.Fr(i.batchId,"removed")),this.mutationQueue.shift();let s=this.br;return PersistencePromise.forEach(i.mutations,o=>{const l=new __PRIVATE_DocReference(o.key,i.batchId);return s=s.delete(l),this.referenceDelegate.markPotentiallyOrphaned(e,o.key)}).next(()=>{this.br=s})}On(e){}containsKey(e,i){const s=new __PRIVATE_DocReference(i,0),o=this.br.firstAfterOrEqual(s);return PersistencePromise.resolve(i.isEqual(o&&o.key))}performConsistencyCheck(e){return this.mutationQueue.length,PersistencePromise.resolve()}Fr(e,i){return this.vr(e)}vr(e){return 0===this.mutationQueue.length?0:e-this.mutationQueue[0].batchId}Dr(e){const i=this.vr(e);return i<0||i>=this.mutationQueue.length?null:this.mutationQueue[i]}}
/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class __PRIVATE_MemoryRemoteDocumentCacheImpl{constructor(e){this.Mr=e,this.docs=new SortedMap(DocumentKey.comparator),this.size=0}setIndexManager(e){this.indexManager=e}addEntry(e,i){const s=i.key,o=this.docs.get(s),l=o?o.size:0,h=this.Mr(i);return this.docs=this.docs.insert(s,{document:i.mutableCopy(),size:h}),this.size+=h-l,this.indexManager.addToCollectionParentIndex(e,s.path.popLast())}removeEntry(e){const i=this.docs.get(e);i&&(this.docs=this.docs.remove(e),this.size-=i.size)}getEntry(e,i){const s=this.docs.get(i);return PersistencePromise.resolve(s?s.document.mutableCopy():MutableDocument.newInvalidDocument(i))}getEntries(e,i){let s=__PRIVATE_mutableDocumentMap();return i.forEach(e=>{const i=this.docs.get(e);s=s.insert(e,i?i.document.mutableCopy():MutableDocument.newInvalidDocument(e))}),PersistencePromise.resolve(s)}getDocumentsMatchingQuery(e,i,s,o){let l=__PRIVATE_mutableDocumentMap();const h=i.path,d=new DocumentKey(h.child("")),_=this.docs.getIteratorFrom(d);for(;_.hasNext();){const{key:e,value:{document:d}}=_.getNext();if(!h.isPrefixOf(e.path))break;e.path.length>h.length+1||__PRIVATE_indexOffsetComparator(__PRIVATE_newIndexOffsetFromDocument(d),s)<=0||(o.has(d.key)||__PRIVATE_queryMatches(i,d))&&(l=l.insert(d.key,d.mutableCopy()))}return PersistencePromise.resolve(l)}getAllFromCollectionGroup(e,i,s,o){fail()}Or(e,i){return PersistencePromise.forEach(this.docs,e=>i(e))}newChangeBuffer(e){return new __PRIVATE_MemoryRemoteDocumentChangeBuffer(this)}getSize(e){return PersistencePromise.resolve(this.size)}}class __PRIVATE_MemoryRemoteDocumentChangeBuffer extends RemoteDocumentChangeBuffer{constructor(e){super(),this.cr=e}applyChanges(e){const i=[];return this.changes.forEach((s,o)=>{o.isValidDocument()?i.push(this.cr.addEntry(e,o)):this.cr.removeEntry(s)}),PersistencePromise.waitFor(i)}getFromCache(e,i){return this.cr.getEntry(e,i)}getAllFromCache(e,i){return this.cr.getEntries(e,i)}}
/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class __PRIVATE_MemoryTargetCache{constructor(e){this.persistence=e,this.Nr=new ObjectMap(e=>__PRIVATE_canonifyTarget(e),__PRIVATE_targetEquals),this.lastRemoteSnapshotVersion=SnapshotVersion.min(),this.highestTargetId=0,this.Lr=0,this.Br=new __PRIVATE_ReferenceSet,this.targetCount=0,this.kr=__PRIVATE_TargetIdGenerator.Bn()}forEachTarget(e,i){return this.Nr.forEach((e,s)=>i(s)),PersistencePromise.resolve()}getLastRemoteSnapshotVersion(e){return PersistencePromise.resolve(this.lastRemoteSnapshotVersion)}getHighestSequenceNumber(e){return PersistencePromise.resolve(this.Lr)}allocateTargetId(e){return this.highestTargetId=this.kr.next(),PersistencePromise.resolve(this.highestTargetId)}setTargetsMetadata(e,i,s){return s&&(this.lastRemoteSnapshotVersion=s),i>this.Lr&&(this.Lr=i),PersistencePromise.resolve()}Kn(e){this.Nr.set(e.target,e);const i=e.targetId;i>this.highestTargetId&&(this.kr=new __PRIVATE_TargetIdGenerator(i),this.highestTargetId=i),e.sequenceNumber>this.Lr&&(this.Lr=e.sequenceNumber)}addTargetData(e,i){return this.Kn(i),this.targetCount+=1,PersistencePromise.resolve()}updateTargetData(e,i){return this.Kn(i),PersistencePromise.resolve()}removeTargetData(e,i){return this.Nr.delete(i.target),this.Br.gr(i.targetId),this.targetCount-=1,PersistencePromise.resolve()}removeTargets(e,i,s){let o=0;const l=[];return this.Nr.forEach((h,d)=>{d.sequenceNumber<=i&&null===s.get(d.targetId)&&(this.Nr.delete(h),l.push(this.removeMatchingKeysForTargetId(e,d.targetId)),o++)}),PersistencePromise.waitFor(l).next(()=>o)}getTargetCount(e){return PersistencePromise.resolve(this.targetCount)}getTargetData(e,i){const s=this.Nr.get(i)||null;return PersistencePromise.resolve(s)}addMatchingKeys(e,i,s){return this.Br.Rr(i,s),PersistencePromise.resolve()}removeMatchingKeys(e,i,s){this.Br.mr(i,s);const o=this.persistence.referenceDelegate,l=[];return o&&i.forEach(i=>{l.push(o.markPotentiallyOrphaned(e,i))}),PersistencePromise.waitFor(l)}removeMatchingKeysForTargetId(e,i){return this.Br.gr(i),PersistencePromise.resolve()}getMatchingKeysForTargetId(e,i){const s=this.Br.yr(i);return PersistencePromise.resolve(s)}containsKey(e,i){return PersistencePromise.resolve(this.Br.containsKey(i))}}
/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class __PRIVATE_MemoryPersistence{constructor(e,i){this.qr={},this.overlays={},this.Qr=new __PRIVATE_ListenSequence(0),this.Kr=!1,this.Kr=!0,this.$r=new __PRIVATE_MemoryGlobalsCache,this.referenceDelegate=e(this),this.Ur=new __PRIVATE_MemoryTargetCache(this),this.indexManager=new __PRIVATE_MemoryIndexManager,this.remoteDocumentCache=new __PRIVATE_MemoryRemoteDocumentCacheImpl(e=>this.referenceDelegate.Wr(e)),this.serializer=new __PRIVATE_LocalSerializer(i),this.Gr=new __PRIVATE_MemoryBundleCache(this.serializer)}start(){return Promise.resolve()}shutdown(){return this.Kr=!1,Promise.resolve()}get started(){return this.Kr}setDatabaseDeletedListener(){}setNetworkEnabled(){}getIndexManager(e){return this.indexManager}getDocumentOverlayCache(e){let i=this.overlays[e.toKey()];return i||(i=new __PRIVATE_MemoryDocumentOverlayCache,this.overlays[e.toKey()]=i),i}getMutationQueue(e,i){let s=this.qr[e.toKey()];return s||(s=new __PRIVATE_MemoryMutationQueue(i,this.referenceDelegate),this.qr[e.toKey()]=s),s}getGlobalsCache(){return this.$r}getTargetCache(){return this.Ur}getRemoteDocumentCache(){return this.remoteDocumentCache}getBundleCache(){return this.Gr}runTransaction(e,i,s){__PRIVATE_logDebug("MemoryPersistence","Starting transaction:",e);const o=new __PRIVATE_MemoryTransaction(this.Qr.next());return this.referenceDelegate.zr(),s(o).next(e=>this.referenceDelegate.jr(o).next(()=>e)).toPromise().then(e=>(o.raiseOnCommittedEvent(),e))}Hr(e,i){return PersistencePromise.or(Object.values(this.qr).map(s=>()=>s.containsKey(e,i)))}}class __PRIVATE_MemoryTransaction extends PersistenceTransaction{constructor(e){super(),this.currentSequenceNumber=e}}class __PRIVATE_MemoryEagerDelegate{constructor(e){this.persistence=e,this.Jr=new __PRIVATE_ReferenceSet,this.Yr=null}static Zr(e){return new __PRIVATE_MemoryEagerDelegate(e)}get Xr(){if(this.Yr)return this.Yr;throw fail()}addReference(e,i,s){return this.Jr.addReference(s,i),this.Xr.delete(s.toString()),PersistencePromise.resolve()}removeReference(e,i,s){return this.Jr.removeReference(s,i),this.Xr.add(s.toString()),PersistencePromise.resolve()}markPotentiallyOrphaned(e,i){return this.Xr.add(i.toString()),PersistencePromise.resolve()}removeTarget(e,i){this.Jr.gr(i.targetId).forEach(e=>this.Xr.add(e.toString()));const s=this.persistence.getTargetCache();return s.getMatchingKeysForTargetId(e,i.targetId).next(e=>{e.forEach(e=>this.Xr.add(e.toString()))}).next(()=>s.removeTargetData(e,i))}zr(){this.Yr=new Set}jr(e){const i=this.persistence.getRemoteDocumentCache().newChangeBuffer();return PersistencePromise.forEach(this.Xr,s=>{const o=DocumentKey.fromPath(s);return this.ei(e,o).next(e=>{e||i.removeEntry(o,SnapshotVersion.min())})}).next(()=>(this.Yr=null,i.apply(e)))}updateLimboDocument(e,i){return this.ei(e,i).next(e=>{e?this.Xr.delete(i.toString()):this.Xr.add(i.toString())})}Wr(e){return 0}ei(e,i){return PersistencePromise.or([()=>PersistencePromise.resolve(this.Jr.containsKey(i)),()=>this.persistence.getTargetCache().containsKey(e,i),()=>this.persistence.Hr(e,i)])}}
/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class __PRIVATE_LocalViewChanges{constructor(e,i,s,o){this.targetId=e,this.fromCache=i,this.$i=s,this.Ui=o}static Wi(e,i){let s=__PRIVATE_documentKeySet(),o=__PRIVATE_documentKeySet();for(const l of i.docChanges)switch(l.type){case 0:s=s.add(l.doc.key);break;case 1:o=o.add(l.doc.key)}return new __PRIVATE_LocalViewChanges(e,i.fromCache,s,o)}}
/**
 * @license
 * Copyright 2023 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class QueryContext{constructor(){this._documentReadCount=0}get documentReadCount(){return this._documentReadCount}incrementDocumentReadCount(e){this._documentReadCount+=e}}
/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class __PRIVATE_QueryEngine{constructor(){this.Gi=!1,this.zi=!1,this.ji=100,this.Hi=isSafari()?8:function(e){const i=e.match(/Android ([\d.]+)/i),s=i?i[1].split(".").slice(0,2).join("."):"-1";return Number(s)}(getUA())>0?6:4}initialize(e,i){this.Ji=e,this.indexManager=i,this.Gi=!0}getDocumentsMatchingQuery(e,i,s,o){const l={result:null};return this.Yi(e,i).next(e=>{l.result=e}).next(()=>{if(!l.result)return this.Zi(e,i,o,s).next(e=>{l.result=e})}).next(()=>{if(l.result)return;const s=new QueryContext;return this.Xi(e,i,s).next(o=>{if(l.result=o,this.zi)return this.es(e,i,s,o.size)})}).next(()=>l.result)}es(e,i,s,l){return s.documentReadCount<this.ji?(__PRIVATE_getLogLevel()<=o.DEBUG&&__PRIVATE_logDebug("QueryEngine","SDK will not create cache indexes for query:",__PRIVATE_stringifyQuery(i),"since it only creates cache indexes for collection contains","more than or equal to",this.ji,"documents"),PersistencePromise.resolve()):(__PRIVATE_getLogLevel()<=o.DEBUG&&__PRIVATE_logDebug("QueryEngine","Query:",__PRIVATE_stringifyQuery(i),"scans",s.documentReadCount,"local documents and returns",l,"documents as results."),s.documentReadCount>this.Hi*l?(__PRIVATE_getLogLevel()<=o.DEBUG&&__PRIVATE_logDebug("QueryEngine","The SDK decides to create cache indexes for query:",__PRIVATE_stringifyQuery(i),"as using cache indexes may help improve performance."),this.indexManager.createTargetIndexes(e,__PRIVATE_queryToTarget(i))):PersistencePromise.resolve())}Yi(e,i){if(__PRIVATE_queryMatchesAllDocuments(i))return PersistencePromise.resolve(null);let s=__PRIVATE_queryToTarget(i);return this.indexManager.getIndexType(e,s).next(o=>0===o?null:(null!==i.limit&&1===o&&(i=__PRIVATE_queryWithLimit(i,null,"F"),s=__PRIVATE_queryToTarget(i)),this.indexManager.getDocumentsMatchingTarget(e,s).next(o=>{const l=__PRIVATE_documentKeySet(...o);return this.Ji.getDocuments(e,l).next(o=>this.indexManager.getMinOffset(e,s).next(s=>{const h=this.ts(i,o);return this.ns(i,h,l,s.readTime)?this.Yi(e,__PRIVATE_queryWithLimit(i,null,"F")):this.rs(e,h,i,s)}))})))}Zi(e,i,s,l){return __PRIVATE_queryMatchesAllDocuments(i)||l.isEqual(SnapshotVersion.min())?PersistencePromise.resolve(null):this.Ji.getDocuments(e,s).next(h=>{const d=this.ts(i,h);return this.ns(i,d,s,l)?PersistencePromise.resolve(null):(__PRIVATE_getLogLevel()<=o.DEBUG&&__PRIVATE_logDebug("QueryEngine","Re-using previous result from %s to execute query: %s",l.toString(),__PRIVATE_stringifyQuery(i)),this.rs(e,d,i,function(e,i){const s=e.toTimestamp().seconds,o=e.toTimestamp().nanoseconds+1,l=SnapshotVersion.fromTimestamp(1e9===o?new Timestamp(s+1,0):new Timestamp(s,o));return new IndexOffset(l,DocumentKey.empty(),i)}(l,-1)).next(e=>e))})}ts(e,i){let s=new SortedSet(__PRIVATE_newQueryComparator(e));return i.forEach((i,o)=>{__PRIVATE_queryMatches(e,o)&&(s=s.add(o))}),s}ns(e,i,s,o){if(null===e.limit)return!1;if(s.size!==i.size)return!0;const l="F"===e.limitType?i.last():i.first();return!!l&&(l.hasPendingWrites||l.version.compareTo(o)>0)}Xi(e,i,s){return __PRIVATE_getLogLevel()<=o.DEBUG&&__PRIVATE_logDebug("QueryEngine","Using full collection scan to execute query:",__PRIVATE_stringifyQuery(i)),this.Ji.getDocumentsMatchingQuery(e,i,IndexOffset.min(),s)}rs(e,i,s,o){return this.Ji.getDocumentsMatchingQuery(e,s,o).next(e=>(i.forEach(i=>{e=e.insert(i.key,i)}),e))}}
/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class __PRIVATE_LocalStoreImpl{constructor(e,i,s,o){this.persistence=e,this.ss=i,this.serializer=o,this.os=new SortedMap(__PRIVATE_primitiveComparator),this._s=new ObjectMap(e=>__PRIVATE_canonifyTarget(e),__PRIVATE_targetEquals),this.us=new Map,this.cs=e.getRemoteDocumentCache(),this.Ur=e.getTargetCache(),this.Gr=e.getBundleCache(),this.ls(s)}ls(e){this.documentOverlayCache=this.persistence.getDocumentOverlayCache(e),this.indexManager=this.persistence.getIndexManager(e),this.mutationQueue=this.persistence.getMutationQueue(e,this.indexManager),this.localDocuments=new LocalDocumentsView(this.cs,this.mutationQueue,this.documentOverlayCache,this.indexManager),this.cs.setIndexManager(this.indexManager),this.ss.initialize(this.localDocuments,this.indexManager)}collectGarbage(e){return this.persistence.runTransaction("Collect garbage","readwrite-primary",i=>e.collect(i,this.os))}}async function __PRIVATE_localStoreHandleUserChange(e,i){const s=__PRIVATE_debugCast(e);return await s.persistence.runTransaction("Handle user change","readonly",e=>{let o;return s.mutationQueue.getAllMutationBatches(e).next(l=>(o=l,s.ls(i),s.mutationQueue.getAllMutationBatches(e))).next(i=>{const l=[],h=[];let d=__PRIVATE_documentKeySet();for(const e of o){l.push(e.batchId);for(const i of e.mutations)d=d.add(i.key)}for(const e of i){h.push(e.batchId);for(const i of e.mutations)d=d.add(i.key)}return s.localDocuments.getDocuments(e,d).next(e=>({hs:e,removedBatchIds:l,addedBatchIds:h}))})})}function __PRIVATE_localStoreGetLastRemoteSnapshotVersion(e){const i=__PRIVATE_debugCast(e);return i.persistence.runTransaction("Get last remote snapshot version","readonly",e=>i.Ur.getLastRemoteSnapshotVersion(e))}function __PRIVATE_localStoreApplyRemoteEventToLocalCache(e,i){const s=__PRIVATE_debugCast(e),o=i.snapshotVersion;let l=s.os;return s.persistence.runTransaction("Apply remote event","readwrite-primary",e=>{const h=s.cs.newChangeBuffer({trackRemovals:!0});l=s.os;const d=[];i.targetChanges.forEach((h,_)=>{const f=l.get(_);if(!f)return;d.push(s.Ur.removeMatchingKeys(e,h.removedDocuments,_).next(()=>s.Ur.addMatchingKeys(e,h.addedDocuments,_)));let g=f.withSequenceNumber(e.currentSequenceNumber);var v,w,b;null!==i.targetMismatches.get(_)?g=g.withResumeToken(ByteString.EMPTY_BYTE_STRING,SnapshotVersion.min()).withLastLimboFreeSnapshotVersion(SnapshotVersion.min()):h.resumeToken.approximateByteSize()>0&&(g=g.withResumeToken(h.resumeToken,o)),l=l.insert(_,g),w=g,b=h,(0===(v=f).resumeToken.approximateByteSize()||w.snapshotVersion.toMicroseconds()-v.snapshotVersion.toMicroseconds()>=3e8||b.addedDocuments.size+b.modifiedDocuments.size+b.removedDocuments.size>0)&&d.push(s.Ur.updateTargetData(e,g))});let _=__PRIVATE_mutableDocumentMap(),f=__PRIVATE_documentKeySet();if(i.documentUpdates.forEach(o=>{i.resolvedLimboDocuments.has(o)&&d.push(s.persistence.referenceDelegate.updateLimboDocument(e,o))}),d.push(function(e,i,s){let o=__PRIVATE_documentKeySet(),l=__PRIVATE_documentKeySet();return s.forEach(e=>o=o.add(e)),i.getEntries(e,o).next(e=>{let o=__PRIVATE_mutableDocumentMap();return s.forEach((s,h)=>{const d=e.get(s);h.isFoundDocument()!==d.isFoundDocument()&&(l=l.add(s)),h.isNoDocument()&&h.version.isEqual(SnapshotVersion.min())?(i.removeEntry(s,h.readTime),o=o.insert(s,h)):!d.isValidDocument()||h.version.compareTo(d.version)>0||0===h.version.compareTo(d.version)&&d.hasPendingWrites?(i.addEntry(h),o=o.insert(s,h)):__PRIVATE_logDebug("LocalStore","Ignoring outdated watch update for ",s,". Current version:",d.version," Watch version:",h.version)}),{Ps:o,Is:l}})}(e,h,i.documentUpdates).next(e=>{_=e.Ps,f=e.Is})),!o.isEqual(SnapshotVersion.min())){const i=s.Ur.getLastRemoteSnapshotVersion(e).next(i=>s.Ur.setTargetsMetadata(e,e.currentSequenceNumber,o));d.push(i)}return PersistencePromise.waitFor(d).next(()=>h.apply(e)).next(()=>s.localDocuments.getLocalViewOfDocuments(e,_,f)).next(()=>_)}).then(e=>(s.os=l,e))}function __PRIVATE_localStoreGetNextMutationBatch(e,i){const s=__PRIVATE_debugCast(e);return s.persistence.runTransaction("Get next mutation batch","readonly",e=>(void 0===i&&(i=-1),s.mutationQueue.getNextMutationBatchAfterBatchId(e,i)))}async function __PRIVATE_localStoreReleaseTarget(e,i,s){const o=__PRIVATE_debugCast(e),l=o.os.get(i),h=s?"readwrite":"readwrite-primary";try{s||await o.persistence.runTransaction("Release target",h,e=>o.persistence.referenceDelegate.removeTarget(e,l))}catch(d){if(!__PRIVATE_isIndexedDbTransactionError(d))throw d;__PRIVATE_logDebug("LocalStore",`Failed to update sequence numbers for target ${i}: ${d}`)}o.os=o.os.remove(i),o._s.delete(l.target)}function __PRIVATE_localStoreExecuteQuery(e,i,s){const o=__PRIVATE_debugCast(e);let l=SnapshotVersion.min(),h=__PRIVATE_documentKeySet();return o.persistence.runTransaction("Execute query","readwrite",e=>function(e,i,s){const o=__PRIVATE_debugCast(e),l=o._s.get(s);return void 0!==l?PersistencePromise.resolve(o.os.get(l)):o.Ur.getTargetData(i,s)}(o,e,__PRIVATE_queryToTarget(i)).next(i=>{if(i)return l=i.lastLimboFreeSnapshotVersion,o.Ur.getMatchingKeysForTargetId(e,i.targetId).next(e=>{h=e})}).next(()=>o.ss.getDocumentsMatchingQuery(e,i,s?l:SnapshotVersion.min(),s?h:__PRIVATE_documentKeySet())).next(e=>(function(e,i,s){let o=e.us.get(i)||SnapshotVersion.min();s.forEach((e,i)=>{i.readTime.compareTo(o)>0&&(o=i.readTime)}),e.us.set(i,o)}(o,function(e){return e.collectionGroup||(e.path.length%2==1?e.path.lastSegment():e.path.get(e.path.length-2))}(i),e),{documents:e,Ts:h})))}class __PRIVATE_LocalClientState{constructor(){this.activeTargetIds=qt}fs(e){this.activeTargetIds=this.activeTargetIds.add(e)}gs(e){this.activeTargetIds=this.activeTargetIds.delete(e)}Vs(){const e={activeTargetIds:this.activeTargetIds.toArray(),updateTimeMs:Date.now()};return JSON.stringify(e)}}class __PRIVATE_MemorySharedClientState{constructor(){this.so=new __PRIVATE_LocalClientState,this.oo={},this.onlineStateHandler=null,this.sequenceNumberHandler=null}addPendingMutation(e){}updateMutationState(e,i,s){}addLocalQueryTarget(e,i=!0){return i&&this.so.fs(e),this.oo[e]||"not-current"}updateQueryState(e,i,s){this.oo[e]=i}removeLocalQueryTarget(e){this.so.gs(e)}isLocalQueryTarget(e){return this.so.activeTargetIds.has(e)}clearQueryState(e){delete this.oo[e]}getAllActiveQueryTargets(){return this.so.activeTargetIds}isActiveQueryTarget(e){return this.so.activeTargetIds.has(e)}start(){return this.so=new __PRIVATE_LocalClientState,Promise.resolve()}handleUserChange(e,i,s){}setOnlineState(e){}shutdown(){}writeSequenceNumber(e){}notifyBundleLoaded(e){}}
/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class __PRIVATE_NoopConnectivityMonitor{_o(e){}shutdown(){}}
/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class __PRIVATE_BrowserConnectivityMonitor{constructor(){this.ao=()=>this.uo(),this.co=()=>this.lo(),this.ho=[],this.Po()}_o(e){this.ho.push(e)}shutdown(){window.removeEventListener("online",this.ao),window.removeEventListener("offline",this.co)}Po(){window.addEventListener("online",this.ao),window.addEventListener("offline",this.co)}uo(){__PRIVATE_logDebug("ConnectivityMonitor","Network connectivity changed: AVAILABLE");for(const e of this.ho)e(0)}lo(){__PRIVATE_logDebug("ConnectivityMonitor","Network connectivity changed: UNAVAILABLE");for(const e of this.ho)e(1)}static D(){return"undefined"!=typeof window&&void 0!==window.addEventListener&&void 0!==window.removeEventListener}}
/**
 * @license
 * Copyright 2023 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */let Qt=null;function __PRIVATE_generateUniqueDebugId(){return null===Qt?Qt=268435456+Math.round(2147483648*Math.random()):Qt++,"0x"+Qt.toString(16)
/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */}const Ht={BatchGetDocuments:"batchGet",Commit:"commit",RunQuery:"runQuery",RunAggregationQuery:"runAggregationQuery"};
/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class __PRIVATE_StreamBridge{constructor(e){this.Io=e.Io,this.To=e.To}Eo(e){this.Ao=e}Ro(e){this.Vo=e}mo(e){this.fo=e}onMessage(e){this.po=e}close(){this.To()}send(e){this.Io(e)}yo(){this.Ao()}wo(){this.Vo()}So(e){this.fo(e)}bo(e){this.po(e)}}
/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Jt="WebChannelConnection";class __PRIVATE_WebChannelConnection extends class{constructor(e){this.databaseInfo=e,this.databaseId=e.databaseId;const i=e.ssl?"https":"http",s=encodeURIComponent(this.databaseId.projectId),o=encodeURIComponent(this.databaseId.database);this.Do=i+"://"+e.host,this.vo=`projects/${s}/databases/${o}`,this.Co="(default)"===this.databaseId.database?`project_id=${s}`:`project_id=${s}&database_id=${o}`}get Fo(){return!1}Mo(e,i,s,o,l){const h=__PRIVATE_generateUniqueDebugId(),d=this.xo(e,i.toUriEncodedString());__PRIVATE_logDebug("RestConnection",`Sending RPC '${e}' ${h}:`,d,s);const _={"google-cloud-resource-prefix":this.vo,"x-goog-request-params":this.Co};return this.Oo(_,o,l),this.No(e,d,_,s).then(i=>(__PRIVATE_logDebug("RestConnection",`Received RPC '${e}' ${h}: `,i),i),i=>{throw __PRIVATE_logWarn("RestConnection",`RPC '${e}' ${h} failed with error: `,i,"url: ",d,"request:",s),i})}Lo(e,i,s,o,l,h){return this.Mo(e,i,s,o,l)}Oo(e,i,s){e["X-Goog-Api-Client"]="gl-js/ fire/"+Dt,e["Content-Type"]="text/plain",this.databaseInfo.appId&&(e["X-Firebase-GMPID"]=this.databaseInfo.appId),i&&i.headers.forEach((i,s)=>e[s]=i),s&&s.headers.forEach((i,s)=>e[s]=i)}xo(e,i){const s=Ht[e];return`${this.Do}/v1/${i}:${s}`}terminate(){}}{constructor(e){super(e),this.forceLongPolling=e.forceLongPolling,this.autoDetectLongPolling=e.autoDetectLongPolling,this.useFetchStreams=e.useFetchStreams,this.longPollingOptions=e.longPollingOptions}No(e,i,s,o){const l=__PRIVATE_generateUniqueDebugId();return new Promise((h,d)=>{const _=new Tt;_.setWithCredentials(!0),_.listenOnce(Pt.COMPLETE,()=>{try{switch(_.getLastErrorCode()){case vt.NO_ERROR:const i=_.getResponseJson();__PRIVATE_logDebug(Jt,`XHR for RPC '${e}' ${l} received:`,JSON.stringify(i)),h(i);break;case vt.TIMEOUT:__PRIVATE_logDebug(Jt,`RPC '${e}' ${l} timed out`),d(new FirestoreError(Nt.DEADLINE_EXCEEDED,"Request time out"));break;case vt.HTTP_ERROR:const s=_.getStatus();if(__PRIVATE_logDebug(Jt,`RPC '${e}' ${l} failed with status:`,s,"response text:",_.getResponseText()),s>0){let e=_.getResponseJson();Array.isArray(e)&&(e=e[0]);const i=null==e?void 0:e.error;if(i&&i.status&&i.message){const e=function(e){const i=e.toLowerCase().replace(/_/g,"-");return Object.values(Nt).indexOf(i)>=0?i:Nt.UNKNOWN}(i.status);d(new FirestoreError(e,i.message))}else d(new FirestoreError(Nt.UNKNOWN,"Server responded with status "+_.getStatus()))}else d(new FirestoreError(Nt.UNAVAILABLE,"Connection failed."));break;default:fail()}}finally{__PRIVATE_logDebug(Jt,`RPC '${e}' ${l} completed.`)}});const f=JSON.stringify(o);__PRIVATE_logDebug(Jt,`RPC '${e}' ${l} sending request:`,o),_.send(i,"POST",f,s,15)})}Bo(e,i,s){const o=__PRIVATE_generateUniqueDebugId(),l=[this.Do,"/","google.firestore.v1.Firestore","/",e,"/channel"],h=bt(),d=Vt(),_={httpSessionIdParam:"gsessionid",initMessageHeaders:{},messageUrlParams:{database:`projects/${this.databaseId.projectId}/databases/${this.databaseId.database}`},sendRawJson:!0,supportsCrossDomainXhr:!0,internalChannelParams:{forwardChannelRequestTimeoutMs:6e5},forceLongPolling:this.forceLongPolling,detectBufferingProxy:this.autoDetectLongPolling},f=this.longPollingOptions.timeoutSeconds;void 0!==f&&(_.longPollingTimeout=Math.round(1e3*f)),this.useFetchStreams&&(_.useFetchStreams=!0),this.Oo(_.initMessageHeaders,i,s),_.encodeInitMessageHeaders=!0;const g=l.join("");__PRIVATE_logDebug(Jt,`Creating RPC '${e}' stream ${o}: ${g}`,_);const v=h.createWebChannel(g,_);let w=!1,b=!1;const S=new __PRIVATE_StreamBridge({Io:i=>{b?__PRIVATE_logDebug(Jt,`Not sending because RPC '${e}' stream ${o} is closed:`,i):(w||(__PRIVATE_logDebug(Jt,`Opening RPC '${e}' stream ${o} transport.`),v.open(),w=!0),__PRIVATE_logDebug(Jt,`RPC '${e}' stream ${o} sending:`,i),v.send(i))},To:()=>v.close()}),__PRIVATE_unguardedEventListen=(e,i,s)=>{e.listen(i,e=>{try{s(e)}catch(i){setTimeout(()=>{throw i},0)}})};return __PRIVATE_unguardedEventListen(v,At.EventType.OPEN,()=>{b||(__PRIVATE_logDebug(Jt,`RPC '${e}' stream ${o} transport opened.`),S.yo())}),__PRIVATE_unguardedEventListen(v,At.EventType.CLOSE,()=>{b||(b=!0,__PRIVATE_logDebug(Jt,`RPC '${e}' stream ${o} transport closed`),S.So())}),__PRIVATE_unguardedEventListen(v,At.EventType.ERROR,i=>{b||(b=!0,__PRIVATE_logWarn(Jt,`RPC '${e}' stream ${o} transport errored:`,i),S.So(new FirestoreError(Nt.UNAVAILABLE,"The operation could not be completed")))}),__PRIVATE_unguardedEventListen(v,At.EventType.MESSAGE,i=>{var s;if(!b){const l=i.data[0];__PRIVATE_hardAssert(!!l);const h=l,d=h.error||(null===(s=h[0])||void 0===s?void 0:s.error);if(d){__PRIVATE_logDebug(Jt,`RPC '${e}' stream ${o} received error:`,d);const i=d.status;let s=function(e){const i=jt[e];if(void 0!==i)return __PRIVATE_mapCodeFromRpcCode(i)}(i),l=d.message;void 0===s&&(s=Nt.INTERNAL,l="Unknown error status: "+i+" with message "+d.message),b=!0,S.So(new FirestoreError(s,l)),v.close()}else __PRIVATE_logDebug(Jt,`RPC '${e}' stream ${o} received:`,l),S.bo(l)}}),__PRIVATE_unguardedEventListen(d,wt.STAT_EVENT,i=>{i.stat===Rt.PROXY?__PRIVATE_logDebug(Jt,`RPC '${e}' stream ${o} detected buffering proxy`):i.stat===Rt.NOPROXY&&__PRIVATE_logDebug(Jt,`RPC '${e}' stream ${o} detected no buffering proxy`)}),setTimeout(()=>{S.wo()},0),S}}function getDocument(){return"undefined"!=typeof document?document:null}
/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function __PRIVATE_newSerializer(e){return new JsonProtoSerializer(e,!0)}
/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class __PRIVATE_ExponentialBackoff{constructor(e,i,s=1e3,o=1.5,l=6e4){this.ui=e,this.timerId=i,this.ko=s,this.qo=o,this.Qo=l,this.Ko=0,this.$o=null,this.Uo=Date.now(),this.reset()}reset(){this.Ko=0}Wo(){this.Ko=this.Qo}Go(e){this.cancel();const i=Math.floor(this.Ko+this.zo()),s=Math.max(0,Date.now()-this.Uo),o=Math.max(0,i-s);o>0&&__PRIVATE_logDebug("ExponentialBackoff",`Backing off for ${o} ms (base delay: ${this.Ko} ms, delay with jitter: ${i} ms, last attempt: ${s} ms ago)`),this.$o=this.ui.enqueueAfterDelay(this.timerId,o,()=>(this.Uo=Date.now(),e())),this.Ko*=this.qo,this.Ko<this.ko&&(this.Ko=this.ko),this.Ko>this.Qo&&(this.Ko=this.Qo)}jo(){null!==this.$o&&(this.$o.skipDelay(),this.$o=null)}cancel(){null!==this.$o&&(this.$o.cancel(),this.$o=null)}zo(){return(Math.random()-.5)*this.Ko}}
/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class __PRIVATE_PersistentStream{constructor(e,i,s,o,l,h,d,_){this.ui=e,this.Ho=s,this.Jo=o,this.connection=l,this.authCredentialsProvider=h,this.appCheckCredentialsProvider=d,this.listener=_,this.state=0,this.Yo=0,this.Zo=null,this.Xo=null,this.stream=null,this.e_=0,this.t_=new __PRIVATE_ExponentialBackoff(e,i)}n_(){return 1===this.state||5===this.state||this.r_()}r_(){return 2===this.state||3===this.state}start(){this.e_=0,4!==this.state?this.auth():this.i_()}async stop(){this.n_()&&await this.close(0)}s_(){this.state=0,this.t_.reset()}o_(){this.r_()&&null===this.Zo&&(this.Zo=this.ui.enqueueAfterDelay(this.Ho,6e4,()=>this.__()))}a_(e){this.u_(),this.stream.send(e)}async __(){if(this.r_())return this.close(0)}u_(){this.Zo&&(this.Zo.cancel(),this.Zo=null)}c_(){this.Xo&&(this.Xo.cancel(),this.Xo=null)}async close(e,i){this.u_(),this.c_(),this.t_.cancel(),this.Yo++,4!==e?this.t_.reset():i&&i.code===Nt.RESOURCE_EXHAUSTED?(__PRIVATE_logError(i.toString()),__PRIVATE_logError("Using maximum backoff delay to prevent overloading the backend."),this.t_.Wo()):i&&i.code===Nt.UNAUTHENTICATED&&3!==this.state&&(this.authCredentialsProvider.invalidateToken(),this.appCheckCredentialsProvider.invalidateToken()),null!==this.stream&&(this.l_(),this.stream.close(),this.stream=null),this.state=e,await this.listener.mo(i)}l_(){}auth(){this.state=1;const e=this.h_(this.Yo),i=this.Yo;Promise.all([this.authCredentialsProvider.getToken(),this.appCheckCredentialsProvider.getToken()]).then(([e,s])=>{this.Yo===i&&this.P_(e,s)},i=>{e(()=>{const e=new FirestoreError(Nt.UNKNOWN,"Fetching auth token failed: "+i.message);return this.I_(e)})})}P_(e,i){const s=this.h_(this.Yo);this.stream=this.T_(e,i),this.stream.Eo(()=>{s(()=>this.listener.Eo())}),this.stream.Ro(()=>{s(()=>(this.state=2,this.Xo=this.ui.enqueueAfterDelay(this.Jo,1e4,()=>(this.r_()&&(this.state=3),Promise.resolve())),this.listener.Ro()))}),this.stream.mo(e=>{s(()=>this.I_(e))}),this.stream.onMessage(e=>{s(()=>1==++this.e_?this.E_(e):this.onNext(e))})}i_(){this.state=5,this.t_.Go(async()=>{this.state=0,this.start()})}I_(e){return __PRIVATE_logDebug("PersistentStream",`close with error: ${e}`),this.stream=null,this.close(4,e)}h_(e){return i=>{this.ui.enqueueAndForget(()=>this.Yo===e?i():(__PRIVATE_logDebug("PersistentStream","stream callback skipped by getCloseGuardedDispatcher."),Promise.resolve()))}}}class __PRIVATE_PersistentListenStream extends __PRIVATE_PersistentStream{constructor(e,i,s,o,l,h){super(e,"listen_stream_connection_backoff","listen_stream_idle","health_check_timeout",i,s,o,h),this.serializer=l}T_(e,i){return this.connection.Bo("Listen",e,i)}E_(e){return this.onNext(e)}onNext(e){this.t_.reset();const i=function(e,i){let s;if("targetChange"in i){i.targetChange;const l="NO_CHANGE"===(o=i.targetChange.targetChangeType||"NO_CHANGE")?0:"ADD"===o?1:"REMOVE"===o?2:"CURRENT"===o?3:"RESET"===o?4:fail(),h=i.targetChange.targetIds||[],d=function(e,i){return e.useProto3Json?(__PRIVATE_hardAssert(void 0===i||"string"==typeof i),ByteString.fromBase64String(i||"")):(__PRIVATE_hardAssert(void 0===i||i instanceof Buffer||i instanceof Uint8Array),ByteString.fromUint8Array(i||new Uint8Array))}(e,i.targetChange.resumeToken),_=i.targetChange.cause,f=_&&function(e){const i=void 0===e.code?Nt.UNKNOWN:__PRIVATE_mapCodeFromRpcCode(e.code);return new FirestoreError(i,e.message||"")}(_);s=new __PRIVATE_WatchTargetChange(l,h,d,f||null)}else if("documentChange"in i){i.documentChange;const o=i.documentChange;o.document,o.document.name,o.document.updateTime;const l=fromName(e,o.document.name),h=__PRIVATE_fromVersion(o.document.updateTime),d=o.document.createTime?__PRIVATE_fromVersion(o.document.createTime):SnapshotVersion.min(),_=new ObjectValue({mapValue:{fields:o.document.fields}}),f=MutableDocument.newFoundDocument(l,h,d,_),g=o.targetIds||[],v=o.removedTargetIds||[];s=new __PRIVATE_DocumentWatchChange(g,v,f.key,f)}else if("documentDelete"in i){i.documentDelete;const o=i.documentDelete;o.document;const l=fromName(e,o.document),h=o.readTime?__PRIVATE_fromVersion(o.readTime):SnapshotVersion.min(),d=MutableDocument.newNoDocument(l,h),_=o.removedTargetIds||[];s=new __PRIVATE_DocumentWatchChange([],_,d.key,d)}else if("documentRemove"in i){i.documentRemove;const o=i.documentRemove;o.document;const l=fromName(e,o.document),h=o.removedTargetIds||[];s=new __PRIVATE_DocumentWatchChange([],h,l,null)}else{if(!("filter"in i))return fail();{i.filter;const e=i.filter;e.targetId;const{count:o=0,unchangedNames:l}=e,h=new ExistenceFilter(o,l),d=e.targetId;s=new __PRIVATE_ExistenceFilterChange(d,h)}}var o;return s}(this.serializer,e),s=function(e){if(!("targetChange"in e))return SnapshotVersion.min();const i=e.targetChange;return i.targetIds&&i.targetIds.length?SnapshotVersion.min():i.readTime?__PRIVATE_fromVersion(i.readTime):SnapshotVersion.min()}(e);return this.listener.d_(i,s)}A_(e){const i={};i.database=__PRIVATE_getEncodedDatabaseId(this.serializer),i.addTarget=function(e,i){let s;const o=i.target;if(s=__PRIVATE_targetIsDocumentTarget(o)?{documents:__PRIVATE_toDocumentsTarget(e,o)}:{query:__PRIVATE_toQueryTarget(e,o)._t},s.targetId=i.targetId,i.resumeToken.approximateByteSize()>0){s.resumeToken=__PRIVATE_toBytes(e,i.resumeToken);const o=__PRIVATE_toInt32Proto(e,i.expectedCount);null!==o&&(s.expectedCount=o)}else if(i.snapshotVersion.compareTo(SnapshotVersion.min())>0){s.readTime=toTimestamp(e,i.snapshotVersion.toTimestamp());const o=__PRIVATE_toInt32Proto(e,i.expectedCount);null!==o&&(s.expectedCount=o)}return s}(this.serializer,e);const s=function(e,i){const s=function(e){switch(e){case"TargetPurposeListen":return null;case"TargetPurposeExistenceFilterMismatch":return"existence-filter-mismatch";case"TargetPurposeExistenceFilterMismatchBloom":return"existence-filter-mismatch-bloom";case"TargetPurposeLimboResolution":return"limbo-document";default:return fail()}}(i.purpose);return null==s?null:{"goog-listen-tags":s}}(this.serializer,e);s&&(i.labels=s),this.a_(i)}R_(e){const i={};i.database=__PRIVATE_getEncodedDatabaseId(this.serializer),i.removeTarget=e,this.a_(i)}}class __PRIVATE_PersistentWriteStream extends __PRIVATE_PersistentStream{constructor(e,i,s,o,l,h){super(e,"write_stream_connection_backoff","write_stream_idle","health_check_timeout",i,s,o,h),this.serializer=l}get V_(){return this.e_>0}start(){this.lastStreamToken=void 0,super.start()}l_(){this.V_&&this.m_([])}T_(e,i){return this.connection.Bo("Write",e,i)}E_(e){return __PRIVATE_hardAssert(!!e.streamToken),this.lastStreamToken=e.streamToken,__PRIVATE_hardAssert(!e.writeResults||0===e.writeResults.length),this.listener.f_()}onNext(e){__PRIVATE_hardAssert(!!e.streamToken),this.lastStreamToken=e.streamToken,this.t_.reset();const i=function(e,i){return e&&e.length>0?(__PRIVATE_hardAssert(void 0!==i),e.map(e=>function(e,i){let s=e.updateTime?__PRIVATE_fromVersion(e.updateTime):__PRIVATE_fromVersion(i);return s.isEqual(SnapshotVersion.min())&&(s=__PRIVATE_fromVersion(i)),new MutationResult(s,e.transformResults||[])}(e,i))):[]}(e.writeResults,e.commitTime),s=__PRIVATE_fromVersion(e.commitTime);return this.listener.g_(s,i)}p_(){const e={};e.database=__PRIVATE_getEncodedDatabaseId(this.serializer),this.a_(e)}m_(e){const i={streamToken:this.lastStreamToken,writes:e.map(e=>function(e,i){let s;if(i instanceof __PRIVATE_SetMutation)s={update:__PRIVATE_toMutationDocument(e,i.key,i.value)};else if(i instanceof __PRIVATE_DeleteMutation)s={delete:__PRIVATE_toName(e,i.key)};else if(i instanceof __PRIVATE_PatchMutation)s={update:__PRIVATE_toMutationDocument(e,i.key,i.data),updateMask:__PRIVATE_toDocumentMask(i.fieldMask)};else{if(!(i instanceof __PRIVATE_VerifyMutation))return fail();s={verify:__PRIVATE_toName(e,i.key)}}return i.fieldTransforms.length>0&&(s.updateTransforms=i.fieldTransforms.map(e=>function(e,i){const s=i.transform;if(s instanceof __PRIVATE_ServerTimestampTransform)return{fieldPath:i.field.canonicalString(),setToServerValue:"REQUEST_TIME"};if(s instanceof __PRIVATE_ArrayUnionTransformOperation)return{fieldPath:i.field.canonicalString(),appendMissingElements:{values:s.elements}};if(s instanceof __PRIVATE_ArrayRemoveTransformOperation)return{fieldPath:i.field.canonicalString(),removeAllFromArray:{values:s.elements}};if(s instanceof __PRIVATE_NumericIncrementTransformOperation)return{fieldPath:i.field.canonicalString(),increment:s.Pe};throw fail()}(0,e))),i.precondition.isNone||(s.currentDocument=(o=e,void 0!==(l=i.precondition).updateTime?{updateTime:__PRIVATE_toVersion(o,l.updateTime)}:void 0!==l.exists?{exists:l.exists}:fail())),s;var o,l}(this.serializer,e))};this.a_(i)}}
/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class __PRIVATE_DatastoreImpl extends class{}{constructor(e,i,s,o){super(),this.authCredentials=e,this.appCheckCredentials=i,this.connection=s,this.serializer=o,this.y_=!1}w_(){if(this.y_)throw new FirestoreError(Nt.FAILED_PRECONDITION,"The client has already been terminated.")}Mo(e,i,s,o){return this.w_(),Promise.all([this.authCredentials.getToken(),this.appCheckCredentials.getToken()]).then(([l,h])=>this.connection.Mo(e,__PRIVATE_toResourcePath(i,s),o,l,h)).catch(e=>{throw"FirebaseError"===e.name?(e.code===Nt.UNAUTHENTICATED&&(this.authCredentials.invalidateToken(),this.appCheckCredentials.invalidateToken()),e):new FirestoreError(Nt.UNKNOWN,e.toString())})}Lo(e,i,s,o,l){return this.w_(),Promise.all([this.authCredentials.getToken(),this.appCheckCredentials.getToken()]).then(([h,d])=>this.connection.Lo(e,__PRIVATE_toResourcePath(i,s),o,h,d,l)).catch(e=>{throw"FirebaseError"===e.name?(e.code===Nt.UNAUTHENTICATED&&(this.authCredentials.invalidateToken(),this.appCheckCredentials.invalidateToken()),e):new FirestoreError(Nt.UNKNOWN,e.toString())})}terminate(){this.y_=!0,this.connection.terminate()}}class __PRIVATE_OnlineStateTracker{constructor(e,i){this.asyncQueue=e,this.onlineStateHandler=i,this.state="Unknown",this.S_=0,this.b_=null,this.D_=!0}v_(){0===this.S_&&(this.C_("Unknown"),this.b_=this.asyncQueue.enqueueAfterDelay("online_state_timeout",1e4,()=>(this.b_=null,this.F_("Backend didn't respond within 10 seconds."),this.C_("Offline"),Promise.resolve())))}M_(e){"Online"===this.state?this.C_("Unknown"):(this.S_++,this.S_>=1&&(this.x_(),this.F_(`Connection failed 1 times. Most recent error: ${e.toString()}`),this.C_("Offline")))}set(e){this.x_(),this.S_=0,"Online"===e&&(this.D_=!1),this.C_(e)}C_(e){e!==this.state&&(this.state=e,this.onlineStateHandler(e))}F_(e){const i=`Could not reach Cloud Firestore backend. ${e}\nThis typically indicates that your device does not have a healthy Internet connection at the moment. The client will operate in offline mode until it is able to successfully connect to the backend.`;this.D_?(__PRIVATE_logError(i),this.D_=!1):__PRIVATE_logDebug("OnlineStateTracker",i)}x_(){null!==this.b_&&(this.b_.cancel(),this.b_=null)}}
/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class __PRIVATE_RemoteStoreImpl{constructor(e,i,s,o,l){this.localStore=e,this.datastore=i,this.asyncQueue=s,this.remoteSyncer={},this.O_=[],this.N_=new Map,this.L_=new Set,this.B_=[],this.k_=l,this.k_._o(e=>{s.enqueueAndForget(async()=>{__PRIVATE_canUseNetwork(this)&&(__PRIVATE_logDebug("RemoteStore","Restarting streams for network reachability change."),await async function(e){const i=__PRIVATE_debugCast(e);i.L_.add(4),await __PRIVATE_disableNetworkInternal(i),i.q_.set("Unknown"),i.L_.delete(4),await __PRIVATE_enableNetworkInternal(i)}(this))})}),this.q_=new __PRIVATE_OnlineStateTracker(s,o)}}async function __PRIVATE_enableNetworkInternal(e){if(__PRIVATE_canUseNetwork(e))for(const i of e.B_)await i(!0)}async function __PRIVATE_disableNetworkInternal(e){for(const i of e.B_)await i(!1)}function __PRIVATE_remoteStoreListen(e,i){const s=__PRIVATE_debugCast(e);s.N_.has(i.targetId)||(s.N_.set(i.targetId,i),__PRIVATE_shouldStartWatchStream(s)?__PRIVATE_startWatchStream(s):__PRIVATE_ensureWatchStream(s).r_()&&__PRIVATE_sendWatchRequest(s,i))}function __PRIVATE_remoteStoreUnlisten(e,i){const s=__PRIVATE_debugCast(e),o=__PRIVATE_ensureWatchStream(s);s.N_.delete(i),o.r_()&&__PRIVATE_sendUnwatchRequest(s,i),0===s.N_.size&&(o.r_()?o.o_():__PRIVATE_canUseNetwork(s)&&s.q_.set("Unknown"))}function __PRIVATE_sendWatchRequest(e,i){if(e.Q_.xe(i.targetId),i.resumeToken.approximateByteSize()>0||i.snapshotVersion.compareTo(SnapshotVersion.min())>0){const s=e.remoteSyncer.getRemoteKeysForTarget(i.targetId).size;i=i.withExpectedCount(s)}__PRIVATE_ensureWatchStream(e).A_(i)}function __PRIVATE_sendUnwatchRequest(e,i){e.Q_.xe(i),__PRIVATE_ensureWatchStream(e).R_(i)}function __PRIVATE_startWatchStream(e){e.Q_=new __PRIVATE_WatchChangeAggregator({getRemoteKeysForTarget:i=>e.remoteSyncer.getRemoteKeysForTarget(i),ot:i=>e.N_.get(i)||null,tt:()=>e.datastore.serializer.databaseId}),__PRIVATE_ensureWatchStream(e).start(),e.q_.v_()}function __PRIVATE_shouldStartWatchStream(e){return __PRIVATE_canUseNetwork(e)&&!__PRIVATE_ensureWatchStream(e).n_()&&e.N_.size>0}function __PRIVATE_canUseNetwork(e){return 0===__PRIVATE_debugCast(e).L_.size}function __PRIVATE_cleanUpWatchStreamState(e){e.Q_=void 0}async function __PRIVATE_onWatchStreamConnected(e){e.q_.set("Online")}async function __PRIVATE_onWatchStreamOpen(e){e.N_.forEach((i,s)=>{__PRIVATE_sendWatchRequest(e,i)})}async function __PRIVATE_onWatchStreamClose(e,i){__PRIVATE_cleanUpWatchStreamState(e),__PRIVATE_shouldStartWatchStream(e)?(e.q_.M_(i),__PRIVATE_startWatchStream(e)):e.q_.set("Unknown")}async function __PRIVATE_onWatchStreamChange(e,i,s){if(e.q_.set("Online"),i instanceof __PRIVATE_WatchTargetChange&&2===i.state&&i.cause)try{await async function(e,i){const s=i.cause;for(const o of i.targetIds)e.N_.has(o)&&(await e.remoteSyncer.rejectListen(o,s),e.N_.delete(o),e.Q_.removeTarget(o))}(e,i)}catch(o){__PRIVATE_logDebug("RemoteStore","Failed to remove targets %s: %s ",i.targetIds.join(","),o),await __PRIVATE_disableNetworkUntilRecovery(e,o)}else if(i instanceof __PRIVATE_DocumentWatchChange?e.Q_.Ke(i):i instanceof __PRIVATE_ExistenceFilterChange?e.Q_.He(i):e.Q_.We(i),!s.isEqual(SnapshotVersion.min()))try{const i=await __PRIVATE_localStoreGetLastRemoteSnapshotVersion(e.localStore);s.compareTo(i)>=0&&await function(e,i){const s=e.Q_.rt(i);return s.targetChanges.forEach((s,o)=>{if(s.resumeToken.approximateByteSize()>0){const l=e.N_.get(o);l&&e.N_.set(o,l.withResumeToken(s.resumeToken,i))}}),s.targetMismatches.forEach((i,s)=>{const o=e.N_.get(i);if(!o)return;e.N_.set(i,o.withResumeToken(ByteString.EMPTY_BYTE_STRING,o.snapshotVersion)),__PRIVATE_sendUnwatchRequest(e,i);const l=new TargetData(o.target,i,s,o.sequenceNumber);__PRIVATE_sendWatchRequest(e,l)}),e.remoteSyncer.applyRemoteEvent(s)}(e,s)}catch(l){__PRIVATE_logDebug("RemoteStore","Failed to raise snapshot:",l),await __PRIVATE_disableNetworkUntilRecovery(e,l)}}async function __PRIVATE_disableNetworkUntilRecovery(e,i,s){if(!__PRIVATE_isIndexedDbTransactionError(i))throw i;e.L_.add(1),await __PRIVATE_disableNetworkInternal(e),e.q_.set("Offline"),s||(s=()=>__PRIVATE_localStoreGetLastRemoteSnapshotVersion(e.localStore)),e.asyncQueue.enqueueRetryable(async()=>{__PRIVATE_logDebug("RemoteStore","Retrying IndexedDB access"),await s(),e.L_.delete(1),await __PRIVATE_enableNetworkInternal(e)})}function __PRIVATE_executeWithRecovery(e,i){return i().catch(s=>__PRIVATE_disableNetworkUntilRecovery(e,s,i))}async function __PRIVATE_fillWritePipeline(e){const i=__PRIVATE_debugCast(e),s=__PRIVATE_ensureWriteStream(i);let o=i.O_.length>0?i.O_[i.O_.length-1].batchId:-1;for(;__PRIVATE_canAddToWritePipeline(i);)try{const e=await __PRIVATE_localStoreGetNextMutationBatch(i.localStore,o);if(null===e){0===i.O_.length&&s.o_();break}o=e.batchId,__PRIVATE_addToWritePipeline(i,e)}catch(l){await __PRIVATE_disableNetworkUntilRecovery(i,l)}__PRIVATE_shouldStartWriteStream(i)&&__PRIVATE_startWriteStream(i)}function __PRIVATE_canAddToWritePipeline(e){return __PRIVATE_canUseNetwork(e)&&e.O_.length<10}function __PRIVATE_addToWritePipeline(e,i){e.O_.push(i);const s=__PRIVATE_ensureWriteStream(e);s.r_()&&s.V_&&s.m_(i.mutations)}function __PRIVATE_shouldStartWriteStream(e){return __PRIVATE_canUseNetwork(e)&&!__PRIVATE_ensureWriteStream(e).n_()&&e.O_.length>0}function __PRIVATE_startWriteStream(e){__PRIVATE_ensureWriteStream(e).start()}async function __PRIVATE_onWriteStreamOpen(e){__PRIVATE_ensureWriteStream(e).p_()}async function __PRIVATE_onWriteHandshakeComplete(e){const i=__PRIVATE_ensureWriteStream(e);for(const s of e.O_)i.m_(s.mutations)}async function __PRIVATE_onMutationResult(e,i,s){const o=e.O_.shift(),l=MutationBatchResult.from(o,i,s);await __PRIVATE_executeWithRecovery(e,()=>e.remoteSyncer.applySuccessfulWrite(l)),await __PRIVATE_fillWritePipeline(e)}async function __PRIVATE_onWriteStreamClose(e,i){i&&__PRIVATE_ensureWriteStream(e).V_&&await async function(e,i){if(function(e){switch(e){default:return fail();case Nt.CANCELLED:case Nt.UNKNOWN:case Nt.DEADLINE_EXCEEDED:case Nt.RESOURCE_EXHAUSTED:case Nt.INTERNAL:case Nt.UNAVAILABLE:case Nt.UNAUTHENTICATED:return!1;case Nt.INVALID_ARGUMENT:case Nt.NOT_FOUND:case Nt.ALREADY_EXISTS:case Nt.PERMISSION_DENIED:case Nt.FAILED_PRECONDITION:case Nt.ABORTED:case Nt.OUT_OF_RANGE:case Nt.UNIMPLEMENTED:case Nt.DATA_LOSS:return!0}}(s=i.code)&&s!==Nt.ABORTED){const s=e.O_.shift();__PRIVATE_ensureWriteStream(e).s_(),await __PRIVATE_executeWithRecovery(e,()=>e.remoteSyncer.rejectFailedWrite(s.batchId,i)),await __PRIVATE_fillWritePipeline(e)}var s}(e,i),__PRIVATE_shouldStartWriteStream(e)&&__PRIVATE_startWriteStream(e)}async function __PRIVATE_remoteStoreHandleCredentialChange(e,i){const s=__PRIVATE_debugCast(e);s.asyncQueue.verifyOperationInProgress(),__PRIVATE_logDebug("RemoteStore","RemoteStore received new credentials");const o=__PRIVATE_canUseNetwork(s);s.L_.add(3),await __PRIVATE_disableNetworkInternal(s),o&&s.q_.set("Unknown"),await s.remoteSyncer.handleCredentialChange(i),s.L_.delete(3),await __PRIVATE_enableNetworkInternal(s)}function __PRIVATE_ensureWatchStream(e){return e.K_||(e.K_=function(e,i,s){const o=__PRIVATE_debugCast(e);return o.w_(),new __PRIVATE_PersistentListenStream(i,o.connection,o.authCredentials,o.appCheckCredentials,o.serializer,s)}(e.datastore,e.asyncQueue,{Eo:__PRIVATE_onWatchStreamConnected.bind(null,e),Ro:__PRIVATE_onWatchStreamOpen.bind(null,e),mo:__PRIVATE_onWatchStreamClose.bind(null,e),d_:__PRIVATE_onWatchStreamChange.bind(null,e)}),e.B_.push(async i=>{i?(e.K_.s_(),__PRIVATE_shouldStartWatchStream(e)?__PRIVATE_startWatchStream(e):e.q_.set("Unknown")):(await e.K_.stop(),__PRIVATE_cleanUpWatchStreamState(e))})),e.K_}function __PRIVATE_ensureWriteStream(e){return e.U_||(e.U_=function(e,i,s){const o=__PRIVATE_debugCast(e);return o.w_(),new __PRIVATE_PersistentWriteStream(i,o.connection,o.authCredentials,o.appCheckCredentials,o.serializer,s)}(e.datastore,e.asyncQueue,{Eo:()=>Promise.resolve(),Ro:__PRIVATE_onWriteStreamOpen.bind(null,e),mo:__PRIVATE_onWriteStreamClose.bind(null,e),f_:__PRIVATE_onWriteHandshakeComplete.bind(null,e),g_:__PRIVATE_onMutationResult.bind(null,e)}),e.B_.push(async i=>{i?(e.U_.s_(),await __PRIVATE_fillWritePipeline(e)):(await e.U_.stop(),e.O_.length>0&&(__PRIVATE_logDebug("RemoteStore",`Stopping write stream with ${e.O_.length} pending writes`),e.O_=[]))})),e.U_
/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */}class DelayedOperation{constructor(e,i,s,o,l){this.asyncQueue=e,this.timerId=i,this.targetTimeMs=s,this.op=o,this.removalCallback=l,this.deferred=new __PRIVATE_Deferred,this.then=this.deferred.promise.then.bind(this.deferred.promise),this.deferred.promise.catch(e=>{})}get promise(){return this.deferred.promise}static createAndSchedule(e,i,s,o,l){const h=Date.now()+s,d=new DelayedOperation(e,i,h,o,l);return d.start(s),d}start(e){this.timerHandle=setTimeout(()=>this.handleDelayElapsed(),e)}skipDelay(){return this.handleDelayElapsed()}cancel(e){null!==this.timerHandle&&(this.clearTimeout(),this.deferred.reject(new FirestoreError(Nt.CANCELLED,"Operation cancelled"+(e?": "+e:""))))}handleDelayElapsed(){this.asyncQueue.enqueueAndForget(()=>null!==this.timerHandle?(this.clearTimeout(),this.op().then(e=>this.deferred.resolve(e))):Promise.resolve())}clearTimeout(){null!==this.timerHandle&&(this.removalCallback(this),clearTimeout(this.timerHandle),this.timerHandle=null)}}function __PRIVATE_wrapInUserErrorIfRecoverable(e,i){if(__PRIVATE_logError("AsyncQueue",`${i}: ${e}`),__PRIVATE_isIndexedDbTransactionError(e))return new FirestoreError(Nt.UNAVAILABLE,`${i}: ${e}`);throw e}
/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class DocumentSet{constructor(e){this.comparator=e?(i,s)=>e(i,s)||DocumentKey.comparator(i.key,s.key):(e,i)=>DocumentKey.comparator(e.key,i.key),this.keyedMap=documentMap(),this.sortedSet=new SortedMap(this.comparator)}static emptySet(e){return new DocumentSet(e.comparator)}has(e){return null!=this.keyedMap.get(e)}get(e){return this.keyedMap.get(e)}first(){return this.sortedSet.minKey()}last(){return this.sortedSet.maxKey()}isEmpty(){return this.sortedSet.isEmpty()}indexOf(e){const i=this.keyedMap.get(e);return i?this.sortedSet.indexOf(i):-1}get size(){return this.sortedSet.size}forEach(e){this.sortedSet.inorderTraversal((i,s)=>(e(i),!1))}add(e){const i=this.delete(e.key);return i.copy(i.keyedMap.insert(e.key,e),i.sortedSet.insert(e,null))}delete(e){const i=this.get(e);return i?this.copy(this.keyedMap.remove(e),this.sortedSet.remove(i)):this}isEqual(e){if(!(e instanceof DocumentSet))return!1;if(this.size!==e.size)return!1;const i=this.sortedSet.getIterator(),s=e.sortedSet.getIterator();for(;i.hasNext();){const e=i.getNext().key,o=s.getNext().key;if(!e.isEqual(o))return!1}return!0}toString(){const e=[];return this.forEach(i=>{e.push(i.toString())}),0===e.length?"DocumentSet ()":"DocumentSet (\n  "+e.join("  \n")+"\n)"}copy(e,i){const s=new DocumentSet;return s.comparator=this.comparator,s.keyedMap=e,s.sortedSet=i,s}}
/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class __PRIVATE_DocumentChangeSet{constructor(){this.W_=new SortedMap(DocumentKey.comparator)}track(e){const i=e.doc.key,s=this.W_.get(i);s?0!==e.type&&3===s.type?this.W_=this.W_.insert(i,e):3===e.type&&1!==s.type?this.W_=this.W_.insert(i,{type:s.type,doc:e.doc}):2===e.type&&2===s.type?this.W_=this.W_.insert(i,{type:2,doc:e.doc}):2===e.type&&0===s.type?this.W_=this.W_.insert(i,{type:0,doc:e.doc}):1===e.type&&0===s.type?this.W_=this.W_.remove(i):1===e.type&&2===s.type?this.W_=this.W_.insert(i,{type:1,doc:s.doc}):0===e.type&&1===s.type?this.W_=this.W_.insert(i,{type:2,doc:e.doc}):fail():this.W_=this.W_.insert(i,e)}G_(){const e=[];return this.W_.inorderTraversal((i,s)=>{e.push(s)}),e}}class ViewSnapshot{constructor(e,i,s,o,l,h,d,_,f){this.query=e,this.docs=i,this.oldDocs=s,this.docChanges=o,this.mutatedKeys=l,this.fromCache=h,this.syncStateChanged=d,this.excludesMetadataChanges=_,this.hasCachedResults=f}static fromInitialDocuments(e,i,s,o,l){const h=[];return i.forEach(e=>{h.push({type:0,doc:e})}),new ViewSnapshot(e,i,DocumentSet.emptySet(i),h,s,o,!0,!1,l)}get hasPendingWrites(){return!this.mutatedKeys.isEmpty()}isEqual(e){if(!(this.fromCache===e.fromCache&&this.hasCachedResults===e.hasCachedResults&&this.syncStateChanged===e.syncStateChanged&&this.mutatedKeys.isEqual(e.mutatedKeys)&&__PRIVATE_queryEquals(this.query,e.query)&&this.docs.isEqual(e.docs)&&this.oldDocs.isEqual(e.oldDocs)))return!1;const i=this.docChanges,s=e.docChanges;if(i.length!==s.length)return!1;for(let o=0;o<i.length;o++)if(i[o].type!==s[o].type||!i[o].doc.isEqual(s[o].doc))return!1;return!0}}
/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class __PRIVATE_QueryListenersInfo{constructor(){this.z_=void 0,this.j_=[]}H_(){return this.j_.some(e=>e.J_())}}class __PRIVATE_EventManagerImpl{constructor(){this.queries=__PRIVATE_newQueriesObjectMap(),this.onlineState="Unknown",this.Y_=new Set}terminate(){!function(e,i){const s=__PRIVATE_debugCast(e),o=s.queries;s.queries=__PRIVATE_newQueriesObjectMap(),o.forEach((e,s)=>{for(const o of s.j_)o.onError(i)})}(this,new FirestoreError(Nt.ABORTED,"Firestore shutting down"))}}function __PRIVATE_newQueriesObjectMap(){return new ObjectMap(e=>__PRIVATE_canonifyQuery(e),__PRIVATE_queryEquals)}async function __PRIVATE_eventManagerListen(e,i){const s=__PRIVATE_debugCast(e);let o=3;const l=i.query;let h=s.queries.get(l);h?!h.H_()&&i.J_()&&(o=2):(h=new __PRIVATE_QueryListenersInfo,o=i.J_()?0:1);try{switch(o){case 0:h.z_=await s.onListen(l,!0);break;case 1:h.z_=await s.onListen(l,!1);break;case 2:await s.onFirstRemoteStoreListen(l)}}catch(d){const e=__PRIVATE_wrapInUserErrorIfRecoverable(d,`Initialization of query '${__PRIVATE_stringifyQuery(i.query)}' failed`);return void i.onError(e)}s.queries.set(l,h),h.j_.push(i),i.Z_(s.onlineState),h.z_&&i.X_(h.z_)&&__PRIVATE_raiseSnapshotsInSyncEvent(s)}async function __PRIVATE_eventManagerUnlisten(e,i){const s=__PRIVATE_debugCast(e),o=i.query;let l=3;const h=s.queries.get(o);if(h){const e=h.j_.indexOf(i);e>=0&&(h.j_.splice(e,1),0===h.j_.length?l=i.J_()?0:1:!h.H_()&&i.J_()&&(l=2))}switch(l){case 0:return s.queries.delete(o),s.onUnlisten(o,!0);case 1:return s.queries.delete(o),s.onUnlisten(o,!1);case 2:return s.onLastRemoteStoreUnlisten(o);default:return}}function __PRIVATE_eventManagerOnWatchChange(e,i){const s=__PRIVATE_debugCast(e);let o=!1;for(const l of i){const e=l.query,i=s.queries.get(e);if(i){for(const e of i.j_)e.X_(l)&&(o=!0);i.z_=l}}o&&__PRIVATE_raiseSnapshotsInSyncEvent(s)}function __PRIVATE_eventManagerOnWatchError(e,i,s){const o=__PRIVATE_debugCast(e),l=o.queries.get(i);if(l)for(const h of l.j_)h.onError(s);o.queries.delete(i)}function __PRIVATE_raiseSnapshotsInSyncEvent(e){e.Y_.forEach(e=>{e.next()})}var Xt,Yt;(Yt=Xt||(Xt={})).ea="default",Yt.Cache="cache";class __PRIVATE_QueryListener{constructor(e,i,s){this.query=e,this.ta=i,this.na=!1,this.ra=null,this.onlineState="Unknown",this.options=s||{}}X_(e){if(!this.options.includeMetadataChanges){const i=[];for(const s of e.docChanges)3!==s.type&&i.push(s);e=new ViewSnapshot(e.query,e.docs,e.oldDocs,i,e.mutatedKeys,e.fromCache,e.syncStateChanged,!0,e.hasCachedResults)}let i=!1;return this.na?this.ia(e)&&(this.ta.next(e),i=!0):this.sa(e,this.onlineState)&&(this.oa(e),i=!0),this.ra=e,i}onError(e){this.ta.error(e)}Z_(e){this.onlineState=e;let i=!1;return this.ra&&!this.na&&this.sa(this.ra,e)&&(this.oa(this.ra),i=!0),i}sa(e,i){if(!e.fromCache)return!0;if(!this.J_())return!0;const s="Offline"!==i;return(!this.options._a||!s)&&(!e.docs.isEmpty()||e.hasCachedResults||"Offline"===i)}ia(e){if(e.docChanges.length>0)return!0;const i=this.ra&&this.ra.hasPendingWrites!==e.hasPendingWrites;return!(!e.syncStateChanged&&!i)&&!0===this.options.includeMetadataChanges}oa(e){e=ViewSnapshot.fromInitialDocuments(e.query,e.docs,e.mutatedKeys,e.fromCache,e.hasCachedResults),this.na=!0,this.ta.next(e)}J_(){return this.options.source!==Xt.Cache}}
/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class __PRIVATE_AddedLimboDocument{constructor(e){this.key=e}}class __PRIVATE_RemovedLimboDocument{constructor(e){this.key=e}}class __PRIVATE_View{constructor(e,i){this.query=e,this.Ta=i,this.Ea=null,this.hasCachedResults=!1,this.current=!1,this.da=__PRIVATE_documentKeySet(),this.mutatedKeys=__PRIVATE_documentKeySet(),this.Aa=__PRIVATE_newQueryComparator(e),this.Ra=new DocumentSet(this.Aa)}get Va(){return this.Ta}ma(e,i){const s=i?i.fa:new __PRIVATE_DocumentChangeSet,o=i?i.Ra:this.Ra;let l=i?i.mutatedKeys:this.mutatedKeys,h=o,d=!1;const _="F"===this.query.limitType&&o.size===this.query.limit?o.last():null,f="L"===this.query.limitType&&o.size===this.query.limit?o.first():null;if(e.inorderTraversal((e,i)=>{const g=o.get(e),v=__PRIVATE_queryMatches(this.query,i)?i:null,w=!!g&&this.mutatedKeys.has(g.key),b=!!v&&(v.hasLocalMutations||this.mutatedKeys.has(v.key)&&v.hasCommittedMutations);let S=!1;g&&v?g.data.isEqual(v.data)?w!==b&&(s.track({type:3,doc:v}),S=!0):this.ga(g,v)||(s.track({type:2,doc:v}),S=!0,(_&&this.Aa(v,_)>0||f&&this.Aa(v,f)<0)&&(d=!0)):!g&&v?(s.track({type:0,doc:v}),S=!0):g&&!v&&(s.track({type:1,doc:g}),S=!0,(_||f)&&(d=!0)),S&&(v?(h=h.add(v),l=b?l.add(e):l.delete(e)):(h=h.delete(e),l=l.delete(e)))}),null!==this.query.limit)for(;h.size>this.query.limit;){const e="F"===this.query.limitType?h.last():h.first();h=h.delete(e.key),l=l.delete(e.key),s.track({type:1,doc:e})}return{Ra:h,fa:s,ns:d,mutatedKeys:l}}ga(e,i){return e.hasLocalMutations&&i.hasCommittedMutations&&!i.hasLocalMutations}applyChanges(e,i,s,o){const l=this.Ra;this.Ra=e.Ra,this.mutatedKeys=e.mutatedKeys;const h=e.fa.G_();h.sort((e,i)=>function(e,i){const order=e=>{switch(e){case 0:return 1;case 2:case 3:return 2;case 1:return 0;default:return fail()}};return order(e)-order(i)}(e.type,i.type)||this.Aa(e.doc,i.doc)),this.pa(s),o=null!=o&&o;const d=i&&!o?this.ya():[],_=0===this.da.size&&this.current&&!o?1:0,f=_!==this.Ea;return this.Ea=_,0!==h.length||f?{snapshot:new ViewSnapshot(this.query,e.Ra,l,h,e.mutatedKeys,0===_,f,!1,!!s&&s.resumeToken.approximateByteSize()>0),wa:d}:{wa:d}}Z_(e){return this.current&&"Offline"===e?(this.current=!1,this.applyChanges({Ra:this.Ra,fa:new __PRIVATE_DocumentChangeSet,mutatedKeys:this.mutatedKeys,ns:!1},!1)):{wa:[]}}Sa(e){return!this.Ta.has(e)&&!!this.Ra.has(e)&&!this.Ra.get(e).hasLocalMutations}pa(e){e&&(e.addedDocuments.forEach(e=>this.Ta=this.Ta.add(e)),e.modifiedDocuments.forEach(e=>{}),e.removedDocuments.forEach(e=>this.Ta=this.Ta.delete(e)),this.current=e.current)}ya(){if(!this.current)return[];const e=this.da;this.da=__PRIVATE_documentKeySet(),this.Ra.forEach(e=>{this.Sa(e.key)&&(this.da=this.da.add(e.key))});const i=[];return e.forEach(e=>{this.da.has(e)||i.push(new __PRIVATE_RemovedLimboDocument(e))}),this.da.forEach(s=>{e.has(s)||i.push(new __PRIVATE_AddedLimboDocument(s))}),i}ba(e){this.Ta=e.Ts,this.da=__PRIVATE_documentKeySet();const i=this.ma(e.documents);return this.applyChanges(i,!0)}Da(){return ViewSnapshot.fromInitialDocuments(this.query,this.Ra,this.mutatedKeys,0===this.Ea,this.hasCachedResults)}}class __PRIVATE_QueryView{constructor(e,i,s){this.query=e,this.targetId=i,this.view=s}}class LimboResolution{constructor(e){this.key=e,this.va=!1}}class __PRIVATE_SyncEngineImpl{constructor(e,i,s,o,l,h){this.localStore=e,this.remoteStore=i,this.eventManager=s,this.sharedClientState=o,this.currentUser=l,this.maxConcurrentLimboResolutions=h,this.Ca={},this.Fa=new ObjectMap(e=>__PRIVATE_canonifyQuery(e),__PRIVATE_queryEquals),this.Ma=new Map,this.xa=new Set,this.Oa=new SortedMap(DocumentKey.comparator),this.Na=new Map,this.La=new __PRIVATE_ReferenceSet,this.Ba={},this.ka=new Map,this.qa=__PRIVATE_TargetIdGenerator.kn(),this.onlineState="Unknown",this.Qa=void 0}get isPrimaryClient(){return!0===this.Qa}}async function __PRIVATE_syncEngineListen(e,i,s=!0){const o=__PRIVATE_ensureWatchCallbacks(e);let l;const h=o.Fa.get(i);return h?(o.sharedClientState.addLocalQueryTarget(h.targetId),l=h.view.Da()):l=await __PRIVATE_allocateTargetAndMaybeListen(o,i,s,!0),l}async function __PRIVATE_triggerRemoteStoreListen(e,i){const s=__PRIVATE_ensureWatchCallbacks(e);await __PRIVATE_allocateTargetAndMaybeListen(s,i,!0,!1)}async function __PRIVATE_allocateTargetAndMaybeListen(e,i,s,o){const l=await function(e,i){const s=__PRIVATE_debugCast(e);return s.persistence.runTransaction("Allocate target","readwrite",e=>{let o;return s.Ur.getTargetData(e,i).next(l=>l?(o=l,PersistencePromise.resolve(o)):s.Ur.allocateTargetId(e).next(l=>(o=new TargetData(i,l,"TargetPurposeListen",e.currentSequenceNumber),s.Ur.addTargetData(e,o).next(()=>o))))}).then(e=>{const o=s.os.get(e.targetId);return(null===o||e.snapshotVersion.compareTo(o.snapshotVersion)>0)&&(s.os=s.os.insert(e.targetId,e),s._s.set(i,e.targetId)),e})}(e.localStore,__PRIVATE_queryToTarget(i)),h=l.targetId,d=e.sharedClientState.addLocalQueryTarget(h,s);let _;return o&&(_=await async function(e,i,s,o,l){e.Ka=(i,s,o)=>async function(e,i,s,o){let l=i.view.ma(s);l.ns&&(l=await __PRIVATE_localStoreExecuteQuery(e.localStore,i.query,!1).then(({documents:e})=>i.view.ma(e,l)));const h=o&&o.targetChanges.get(i.targetId),d=o&&null!=o.targetMismatches.get(i.targetId),_=i.view.applyChanges(l,e.isPrimaryClient,h,d);return __PRIVATE_updateTrackedLimbos(e,i.targetId,_.wa),_.snapshot}(e,i,s,o);const h=await __PRIVATE_localStoreExecuteQuery(e.localStore,i,!0),d=new __PRIVATE_View(i,h.Ts),_=d.ma(h.documents),f=TargetChange.createSynthesizedTargetChangeForCurrentChange(s,o&&"Offline"!==e.onlineState,l),g=d.applyChanges(_,e.isPrimaryClient,f);__PRIVATE_updateTrackedLimbos(e,s,g.wa);const v=new __PRIVATE_QueryView(i,s,d);return e.Fa.set(i,v),e.Ma.has(s)?e.Ma.get(s).push(i):e.Ma.set(s,[i]),g.snapshot}(e,i,h,"current"===d,l.resumeToken)),e.isPrimaryClient&&s&&__PRIVATE_remoteStoreListen(e.remoteStore,l),_}async function __PRIVATE_syncEngineUnlisten(e,i,s){const o=__PRIVATE_debugCast(e),l=o.Fa.get(i),h=o.Ma.get(l.targetId);if(h.length>1)return o.Ma.set(l.targetId,h.filter(e=>!__PRIVATE_queryEquals(e,i))),void o.Fa.delete(i);o.isPrimaryClient?(o.sharedClientState.removeLocalQueryTarget(l.targetId),o.sharedClientState.isActiveQueryTarget(l.targetId)||await __PRIVATE_localStoreReleaseTarget(o.localStore,l.targetId,!1).then(()=>{o.sharedClientState.clearQueryState(l.targetId),s&&__PRIVATE_remoteStoreUnlisten(o.remoteStore,l.targetId),__PRIVATE_removeAndCleanupTarget(o,l.targetId)}).catch(__PRIVATE_ignoreIfPrimaryLeaseLoss)):(__PRIVATE_removeAndCleanupTarget(o,l.targetId),await __PRIVATE_localStoreReleaseTarget(o.localStore,l.targetId,!0))}async function __PRIVATE_triggerRemoteStoreUnlisten(e,i){const s=__PRIVATE_debugCast(e),o=s.Fa.get(i),l=s.Ma.get(o.targetId);s.isPrimaryClient&&1===l.length&&(s.sharedClientState.removeLocalQueryTarget(o.targetId),__PRIVATE_remoteStoreUnlisten(s.remoteStore,o.targetId))}async function __PRIVATE_syncEngineWrite(e,i,s){const o=function(e){const i=__PRIVATE_debugCast(e);return i.remoteStore.remoteSyncer.applySuccessfulWrite=__PRIVATE_syncEngineApplySuccessfulWrite.bind(null,i),i.remoteStore.remoteSyncer.rejectFailedWrite=__PRIVATE_syncEngineRejectFailedWrite.bind(null,i),i}(e);try{const e=await function(e,i){const s=__PRIVATE_debugCast(e),o=Timestamp.now(),l=i.reduce((e,i)=>e.add(i.key),__PRIVATE_documentKeySet());let h,d;return s.persistence.runTransaction("Locally write mutations","readwrite",e=>{let _=__PRIVATE_mutableDocumentMap(),f=__PRIVATE_documentKeySet();return s.cs.getEntries(e,l).next(e=>{_=e,_.forEach((e,i)=>{i.isValidDocument()||(f=f.add(e))})}).next(()=>s.localDocuments.getOverlayedDocuments(e,_)).next(l=>{h=l;const d=[];for(const e of i){const i=__PRIVATE_mutationExtractBaseValue(e,h.get(e.key).overlayedDocument);null!=i&&d.push(new __PRIVATE_PatchMutation(e.key,i,__PRIVATE_extractFieldMask(i.value.mapValue),Precondition.exists(!0)))}return s.mutationQueue.addMutationBatch(e,o,d,i)}).next(i=>{d=i;const o=i.applyToLocalDocumentSet(h,f);return s.documentOverlayCache.saveOverlays(e,i.batchId,o)})}).then(()=>({batchId:d.batchId,changes:__PRIVATE_convertOverlayedDocumentMapToDocumentMap(h)}))}(o.localStore,i);o.sharedClientState.addPendingMutation(e.batchId),function(e,i,s){let o=e.Ba[e.currentUser.toKey()];o||(o=new SortedMap(__PRIVATE_primitiveComparator)),o=o.insert(i,s),e.Ba[e.currentUser.toKey()]=o}(o,e.batchId,s),await __PRIVATE_syncEngineEmitNewSnapsAndNotifyLocalStore(o,e.changes),await __PRIVATE_fillWritePipeline(o.remoteStore)}catch(l){const e=__PRIVATE_wrapInUserErrorIfRecoverable(l,"Failed to persist write");s.reject(e)}}async function __PRIVATE_syncEngineApplyRemoteEvent(e,i){const s=__PRIVATE_debugCast(e);try{const e=await __PRIVATE_localStoreApplyRemoteEventToLocalCache(s.localStore,i);i.targetChanges.forEach((e,i)=>{const o=s.Na.get(i);o&&(__PRIVATE_hardAssert(e.addedDocuments.size+e.modifiedDocuments.size+e.removedDocuments.size<=1),e.addedDocuments.size>0?o.va=!0:e.modifiedDocuments.size>0?__PRIVATE_hardAssert(o.va):e.removedDocuments.size>0&&(__PRIVATE_hardAssert(o.va),o.va=!1))}),await __PRIVATE_syncEngineEmitNewSnapsAndNotifyLocalStore(s,e,i)}catch(o){await __PRIVATE_ignoreIfPrimaryLeaseLoss(o)}}function __PRIVATE_syncEngineApplyOnlineStateChange(e,i,s){const o=__PRIVATE_debugCast(e);if(o.isPrimaryClient&&0===s||!o.isPrimaryClient&&1===s){const e=[];o.Fa.forEach((s,o)=>{const l=o.view.Z_(i);l.snapshot&&e.push(l.snapshot)}),function(e,i){const s=__PRIVATE_debugCast(e);s.onlineState=i;let o=!1;s.queries.forEach((e,s)=>{for(const l of s.j_)l.Z_(i)&&(o=!0)}),o&&__PRIVATE_raiseSnapshotsInSyncEvent(s)}(o.eventManager,i),e.length&&o.Ca.d_(e),o.onlineState=i,o.isPrimaryClient&&o.sharedClientState.setOnlineState(i)}}async function __PRIVATE_syncEngineRejectListen(e,i,s){const o=__PRIVATE_debugCast(e);o.sharedClientState.updateQueryState(i,"rejected",s);const l=o.Na.get(i),h=l&&l.key;if(h){let e=new SortedMap(DocumentKey.comparator);e=e.insert(h,MutableDocument.newNoDocument(h,SnapshotVersion.min()));const s=__PRIVATE_documentKeySet().add(h),l=new RemoteEvent(SnapshotVersion.min(),new Map,new SortedMap(__PRIVATE_primitiveComparator),e,s);await __PRIVATE_syncEngineApplyRemoteEvent(o,l),o.Oa=o.Oa.remove(h),o.Na.delete(i),__PRIVATE_pumpEnqueuedLimboResolutions(o)}else await __PRIVATE_localStoreReleaseTarget(o.localStore,i,!1).then(()=>__PRIVATE_removeAndCleanupTarget(o,i,s)).catch(__PRIVATE_ignoreIfPrimaryLeaseLoss)}async function __PRIVATE_syncEngineApplySuccessfulWrite(e,i){const s=__PRIVATE_debugCast(e),o=i.batch.batchId;try{const e=await function(e,i){const s=__PRIVATE_debugCast(e);return s.persistence.runTransaction("Acknowledge batch","readwrite-primary",e=>{const o=i.batch.keys(),l=s.cs.newChangeBuffer({trackRemovals:!0});return function(e,i,s,o){const l=s.batch,h=l.keys();let d=PersistencePromise.resolve();return h.forEach(e=>{d=d.next(()=>o.getEntry(i,e)).next(i=>{const h=s.docVersions.get(e);__PRIVATE_hardAssert(null!==h),i.version.compareTo(h)<0&&(l.applyToRemoteDocument(i,s),i.isValidDocument()&&(i.setReadTime(s.commitVersion),o.addEntry(i)))})}),d.next(()=>e.mutationQueue.removeMutationBatch(i,l))}(s,e,i,l).next(()=>l.apply(e)).next(()=>s.mutationQueue.performConsistencyCheck(e)).next(()=>s.documentOverlayCache.removeOverlaysForBatchId(e,o,i.batch.batchId)).next(()=>s.localDocuments.recalculateAndSaveOverlaysForDocumentKeys(e,function(e){let i=__PRIVATE_documentKeySet();for(let s=0;s<e.mutationResults.length;++s)e.mutationResults[s].transformResults.length>0&&(i=i.add(e.batch.mutations[s].key));return i}(i))).next(()=>s.localDocuments.getDocuments(e,o))})}(s.localStore,i);__PRIVATE_processUserCallback(s,o,null),__PRIVATE_triggerPendingWritesCallbacks(s,o),s.sharedClientState.updateMutationState(o,"acknowledged"),await __PRIVATE_syncEngineEmitNewSnapsAndNotifyLocalStore(s,e)}catch(l){await __PRIVATE_ignoreIfPrimaryLeaseLoss(l)}}async function __PRIVATE_syncEngineRejectFailedWrite(e,i,s){const o=__PRIVATE_debugCast(e);try{const e=await function(e,i){const s=__PRIVATE_debugCast(e);return s.persistence.runTransaction("Reject batch","readwrite-primary",e=>{let o;return s.mutationQueue.lookupMutationBatch(e,i).next(i=>(__PRIVATE_hardAssert(null!==i),o=i.keys(),s.mutationQueue.removeMutationBatch(e,i))).next(()=>s.mutationQueue.performConsistencyCheck(e)).next(()=>s.documentOverlayCache.removeOverlaysForBatchId(e,o,i)).next(()=>s.localDocuments.recalculateAndSaveOverlaysForDocumentKeys(e,o)).next(()=>s.localDocuments.getDocuments(e,o))})}(o.localStore,i);__PRIVATE_processUserCallback(o,i,s),__PRIVATE_triggerPendingWritesCallbacks(o,i),o.sharedClientState.updateMutationState(i,"rejected",s),await __PRIVATE_syncEngineEmitNewSnapsAndNotifyLocalStore(o,e)}catch(l){await __PRIVATE_ignoreIfPrimaryLeaseLoss(l)}}function __PRIVATE_triggerPendingWritesCallbacks(e,i){(e.ka.get(i)||[]).forEach(e=>{e.resolve()}),e.ka.delete(i)}function __PRIVATE_processUserCallback(e,i,s){const o=__PRIVATE_debugCast(e);let l=o.Ba[o.currentUser.toKey()];if(l){const e=l.get(i);e&&(s?e.reject(s):e.resolve(),l=l.remove(i)),o.Ba[o.currentUser.toKey()]=l}}function __PRIVATE_removeAndCleanupTarget(e,i,s=null){e.sharedClientState.removeLocalQueryTarget(i);for(const o of e.Ma.get(i))e.Fa.delete(o),s&&e.Ca.$a(o,s);e.Ma.delete(i),e.isPrimaryClient&&e.La.gr(i).forEach(i=>{e.La.containsKey(i)||__PRIVATE_removeLimboTarget(e,i)})}function __PRIVATE_removeLimboTarget(e,i){e.xa.delete(i.path.canonicalString());const s=e.Oa.get(i);null!==s&&(__PRIVATE_remoteStoreUnlisten(e.remoteStore,s),e.Oa=e.Oa.remove(i),e.Na.delete(s),__PRIVATE_pumpEnqueuedLimboResolutions(e))}function __PRIVATE_updateTrackedLimbos(e,i,s){for(const o of s)o instanceof __PRIVATE_AddedLimboDocument?(e.La.addReference(o.key,i),__PRIVATE_trackLimboChange(e,o)):o instanceof __PRIVATE_RemovedLimboDocument?(__PRIVATE_logDebug("SyncEngine","Document no longer in limbo: "+o.key),e.La.removeReference(o.key,i),e.La.containsKey(o.key)||__PRIVATE_removeLimboTarget(e,o.key)):fail()}function __PRIVATE_trackLimboChange(e,i){const s=i.key,o=s.path.canonicalString();e.Oa.get(s)||e.xa.has(o)||(__PRIVATE_logDebug("SyncEngine","New document in limbo: "+s),e.xa.add(o),__PRIVATE_pumpEnqueuedLimboResolutions(e))}function __PRIVATE_pumpEnqueuedLimboResolutions(e){for(;e.xa.size>0&&e.Oa.size<e.maxConcurrentLimboResolutions;){const i=e.xa.values().next().value;e.xa.delete(i);const s=new DocumentKey(ResourcePath.fromString(i)),o=e.qa.next();e.Na.set(o,new LimboResolution(s)),e.Oa=e.Oa.insert(s,o),__PRIVATE_remoteStoreListen(e.remoteStore,new TargetData(__PRIVATE_queryToTarget(__PRIVATE_newQueryForPath(s.path)),o,"TargetPurposeLimboResolution",__PRIVATE_ListenSequence.oe))}}async function __PRIVATE_syncEngineEmitNewSnapsAndNotifyLocalStore(e,i,s){const o=__PRIVATE_debugCast(e),l=[],h=[],d=[];o.Fa.isEmpty()||(o.Fa.forEach((e,_)=>{d.push(o.Ka(_,i,s).then(e=>{var i;if((e||s)&&o.isPrimaryClient){const l=e?!e.fromCache:null===(i=null==s?void 0:s.targetChanges.get(_.targetId))||void 0===i?void 0:i.current;o.sharedClientState.updateQueryState(_.targetId,l?"current":"not-current")}if(e){l.push(e);const i=__PRIVATE_LocalViewChanges.Wi(_.targetId,e);h.push(i)}}))}),await Promise.all(d),o.Ca.d_(l),await async function(e,i){const s=__PRIVATE_debugCast(e);try{await s.persistence.runTransaction("notifyLocalViewChanges","readwrite",e=>PersistencePromise.forEach(i,i=>PersistencePromise.forEach(i.$i,o=>s.persistence.referenceDelegate.addReference(e,i.targetId,o)).next(()=>PersistencePromise.forEach(i.Ui,o=>s.persistence.referenceDelegate.removeReference(e,i.targetId,o)))))}catch(o){if(!__PRIVATE_isIndexedDbTransactionError(o))throw o;__PRIVATE_logDebug("LocalStore","Failed to update sequence numbers: "+o)}for(const l of i){const e=l.targetId;if(!l.fromCache){const i=s.os.get(e),o=i.snapshotVersion,l=i.withLastLimboFreeSnapshotVersion(o);s.os=s.os.insert(e,l)}}}(o.localStore,h))}async function __PRIVATE_syncEngineHandleCredentialChange(e,i){const s=__PRIVATE_debugCast(e);if(!s.currentUser.isEqual(i)){__PRIVATE_logDebug("SyncEngine","User change. New user:",i.toKey());const e=await __PRIVATE_localStoreHandleUserChange(s.localStore,i);s.currentUser=i,l="'waitForPendingWrites' promise is rejected due to a user change.",(o=s).ka.forEach(e=>{e.forEach(e=>{e.reject(new FirestoreError(Nt.CANCELLED,l))})}),o.ka.clear(),s.sharedClientState.handleUserChange(i,e.removedBatchIds,e.addedBatchIds),await __PRIVATE_syncEngineEmitNewSnapsAndNotifyLocalStore(s,e.hs)}var o,l}function __PRIVATE_syncEngineGetRemoteKeysForTarget(e,i){const s=__PRIVATE_debugCast(e),o=s.Na.get(i);if(o&&o.va)return __PRIVATE_documentKeySet().add(o.key);{let e=__PRIVATE_documentKeySet();const o=s.Ma.get(i);if(!o)return e;for(const i of o){const o=s.Fa.get(i);e=e.unionWith(o.view.Va)}return e}}function __PRIVATE_ensureWatchCallbacks(e){const i=__PRIVATE_debugCast(e);return i.remoteStore.remoteSyncer.applyRemoteEvent=__PRIVATE_syncEngineApplyRemoteEvent.bind(null,i),i.remoteStore.remoteSyncer.getRemoteKeysForTarget=__PRIVATE_syncEngineGetRemoteKeysForTarget.bind(null,i),i.remoteStore.remoteSyncer.rejectListen=__PRIVATE_syncEngineRejectListen.bind(null,i),i.Ca.d_=__PRIVATE_eventManagerOnWatchChange.bind(null,i.eventManager),i.Ca.$a=__PRIVATE_eventManagerOnWatchError.bind(null,i.eventManager),i}class __PRIVATE_MemoryOfflineComponentProvider{constructor(){this.kind="memory",this.synchronizeTabs=!1}async initialize(e){this.serializer=__PRIVATE_newSerializer(e.databaseInfo.databaseId),this.sharedClientState=this.Wa(e),this.persistence=this.Ga(e),await this.persistence.start(),this.localStore=this.za(e),this.gcScheduler=this.ja(e,this.localStore),this.indexBackfillerScheduler=this.Ha(e,this.localStore)}ja(e,i){return null}Ha(e,i){return null}za(e){return function(e,i,s,o){return new __PRIVATE_LocalStoreImpl(e,i,s,o)}(this.persistence,new __PRIVATE_QueryEngine,e.initialUser,this.serializer)}Ga(e){return new __PRIVATE_MemoryPersistence(__PRIVATE_MemoryEagerDelegate.Zr,this.serializer)}Wa(e){return new __PRIVATE_MemorySharedClientState}async terminate(){var e,i;null===(e=this.gcScheduler)||void 0===e||e.stop(),null===(i=this.indexBackfillerScheduler)||void 0===i||i.stop(),this.sharedClientState.shutdown(),await this.persistence.shutdown()}}__PRIVATE_MemoryOfflineComponentProvider.provider={build:()=>new __PRIVATE_MemoryOfflineComponentProvider};class OnlineComponentProvider{async initialize(e,i){this.localStore||(this.localStore=e.localStore,this.sharedClientState=e.sharedClientState,this.datastore=this.createDatastore(i),this.remoteStore=this.createRemoteStore(i),this.eventManager=this.createEventManager(i),this.syncEngine=this.createSyncEngine(i,!e.synchronizeTabs),this.sharedClientState.onlineStateHandler=e=>__PRIVATE_syncEngineApplyOnlineStateChange(this.syncEngine,e,1),this.remoteStore.remoteSyncer.handleCredentialChange=__PRIVATE_syncEngineHandleCredentialChange.bind(null,this.syncEngine),await async function(e,i){const s=__PRIVATE_debugCast(e);i?(s.L_.delete(2),await __PRIVATE_enableNetworkInternal(s)):i||(s.L_.add(2),await __PRIVATE_disableNetworkInternal(s),s.q_.set("Unknown"))}(this.remoteStore,this.syncEngine.isPrimaryClient))}createEventManager(e){return new __PRIVATE_EventManagerImpl}createDatastore(e){const i=__PRIVATE_newSerializer(e.databaseInfo.databaseId),s=(o=e.databaseInfo,new __PRIVATE_WebChannelConnection(o));var o;return function(e,i,s,o){return new __PRIVATE_DatastoreImpl(e,i,s,o)}(e.authCredentials,e.appCheckCredentials,s,i)}createRemoteStore(e){return i=this.localStore,s=this.datastore,o=e.asyncQueue,l=e=>__PRIVATE_syncEngineApplyOnlineStateChange(this.syncEngine,e,0),h=__PRIVATE_BrowserConnectivityMonitor.D()?new __PRIVATE_BrowserConnectivityMonitor:new __PRIVATE_NoopConnectivityMonitor,new __PRIVATE_RemoteStoreImpl(i,s,o,l,h);var i,s,o,l,h}createSyncEngine(e,i){return function(e,i,s,o,l,h,d){const _=new __PRIVATE_SyncEngineImpl(e,i,s,o,l,h);return d&&(_.Qa=!0),_}(this.localStore,this.remoteStore,this.eventManager,this.sharedClientState,e.initialUser,e.maxConcurrentLimboResolutions,i)}async terminate(){var e,i;await async function(e){const i=__PRIVATE_debugCast(e);__PRIVATE_logDebug("RemoteStore","RemoteStore shutting down."),i.L_.add(5),await __PRIVATE_disableNetworkInternal(i),i.k_.shutdown(),i.q_.set("Unknown")}(this.remoteStore),null===(e=this.datastore)||void 0===e||e.terminate(),null===(i=this.eventManager)||void 0===i||i.terminate()}}OnlineComponentProvider.provider={build:()=>new OnlineComponentProvider};
/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
class __PRIVATE_AsyncObserver{constructor(e){this.observer=e,this.muted=!1}next(e){this.muted||this.observer.next&&this.Ya(this.observer.next,e)}error(e){this.muted||(this.observer.error?this.Ya(this.observer.error,e):__PRIVATE_logError("Uncaught Error in snapshot listener:",e.toString()))}Za(){this.muted=!0}Ya(e,i){setTimeout(()=>{this.muted||e(i)},0)}}
/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class FirestoreClient{constructor(e,i,s,o,l){this.authCredentials=e,this.appCheckCredentials=i,this.asyncQueue=s,this.databaseInfo=o,this.user=User.UNAUTHENTICATED,this.clientId=__PRIVATE_AutoId.newId(),this.authCredentialListener=()=>Promise.resolve(),this.appCheckCredentialListener=()=>Promise.resolve(),this._uninitializedComponentsProvider=l,this.authCredentials.start(s,async e=>{__PRIVATE_logDebug("FirestoreClient","Received user=",e.uid),await this.authCredentialListener(e),this.user=e}),this.appCheckCredentials.start(s,e=>(__PRIVATE_logDebug("FirestoreClient","Received new app check token=",e),this.appCheckCredentialListener(e,this.user)))}get configuration(){return{asyncQueue:this.asyncQueue,databaseInfo:this.databaseInfo,clientId:this.clientId,authCredentials:this.authCredentials,appCheckCredentials:this.appCheckCredentials,initialUser:this.user,maxConcurrentLimboResolutions:100}}setCredentialChangeListener(e){this.authCredentialListener=e}setAppCheckTokenChangeListener(e){this.appCheckCredentialListener=e}terminate(){this.asyncQueue.enterRestrictedMode();const e=new __PRIVATE_Deferred;return this.asyncQueue.enqueueAndForgetEvenWhileRestricted(async()=>{try{this._onlineComponents&&await this._onlineComponents.terminate(),this._offlineComponents&&await this._offlineComponents.terminate(),this.authCredentials.shutdown(),this.appCheckCredentials.shutdown(),e.resolve()}catch(i){const s=__PRIVATE_wrapInUserErrorIfRecoverable(i,"Failed to shutdown persistence");e.reject(s)}}),e.promise}}async function __PRIVATE_setOfflineComponentProvider(e,i){e.asyncQueue.verifyOperationInProgress(),__PRIVATE_logDebug("FirestoreClient","Initializing OfflineComponentProvider");const s=e.configuration;await i.initialize(s);let o=s.initialUser;e.setCredentialChangeListener(async e=>{o.isEqual(e)||(await __PRIVATE_localStoreHandleUserChange(i.localStore,e),o=e)}),i.persistence.setDatabaseDeletedListener(()=>e.terminate()),e._offlineComponents=i}async function __PRIVATE_setOnlineComponentProvider(e,i){e.asyncQueue.verifyOperationInProgress();const s=await async function(e){if(!e._offlineComponents)if(e._uninitializedComponentsProvider){__PRIVATE_logDebug("FirestoreClient","Using user provided OfflineComponentProvider");try{await __PRIVATE_setOfflineComponentProvider(e,e._uninitializedComponentsProvider._offline)}catch(i){const l=i;if(!("FirebaseError"===(s=l).name?s.code===Nt.FAILED_PRECONDITION||s.code===Nt.UNIMPLEMENTED:!("undefined"!=typeof DOMException&&s instanceof DOMException)||22===s.code||20===s.code||11===s.code))throw l;__PRIVATE_logWarn("Error using user provided cache. Falling back to memory cache: "+l),await __PRIVATE_setOfflineComponentProvider(e,new __PRIVATE_MemoryOfflineComponentProvider)}}else __PRIVATE_logDebug("FirestoreClient","Using default OfflineComponentProvider"),await __PRIVATE_setOfflineComponentProvider(e,new __PRIVATE_MemoryOfflineComponentProvider);var s;return e._offlineComponents}(e);__PRIVATE_logDebug("FirestoreClient","Initializing OnlineComponentProvider"),await i.initialize(s,e.configuration),e.setCredentialChangeListener(e=>__PRIVATE_remoteStoreHandleCredentialChange(i.remoteStore,e)),e.setAppCheckTokenChangeListener((e,s)=>__PRIVATE_remoteStoreHandleCredentialChange(i.remoteStore,s)),e._onlineComponents=i}async function __PRIVATE_ensureOnlineComponents(e){return e._onlineComponents||(e._uninitializedComponentsProvider?(__PRIVATE_logDebug("FirestoreClient","Using user provided OnlineComponentProvider"),await __PRIVATE_setOnlineComponentProvider(e,e._uninitializedComponentsProvider._online)):(__PRIVATE_logDebug("FirestoreClient","Using default OnlineComponentProvider"),await __PRIVATE_setOnlineComponentProvider(e,new OnlineComponentProvider))),e._onlineComponents}async function __PRIVATE_getEventManager(e){const i=await __PRIVATE_ensureOnlineComponents(e),s=i.eventManager;return s.onListen=__PRIVATE_syncEngineListen.bind(null,i.syncEngine),s.onUnlisten=__PRIVATE_syncEngineUnlisten.bind(null,i.syncEngine),s.onFirstRemoteStoreListen=__PRIVATE_triggerRemoteStoreListen.bind(null,i.syncEngine),s.onLastRemoteStoreUnlisten=__PRIVATE_triggerRemoteStoreUnlisten.bind(null,i.syncEngine),s}
/**
 * @license
 * Copyright 2023 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
function __PRIVATE_cloneLongPollingOptions(e){const i={};return void 0!==e.timeoutSeconds&&(i.timeoutSeconds=e.timeoutSeconds),i
/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */}const Zt=new Map;
/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function __PRIVATE_validateNonEmptyArgument(e,i,s){if(!s)throw new FirestoreError(Nt.INVALID_ARGUMENT,`Function ${e}() cannot be called with an empty ${i}.`)}function __PRIVATE_validateDocumentPath(e){if(!DocumentKey.isDocumentKey(e))throw new FirestoreError(Nt.INVALID_ARGUMENT,`Invalid document reference. Document references must have an even number of segments, but ${e} has ${e.length}.`)}function __PRIVATE_validateCollectionPath(e){if(DocumentKey.isDocumentKey(e))throw new FirestoreError(Nt.INVALID_ARGUMENT,`Invalid collection reference. Collection references must have an odd number of segments, but ${e} has ${e.length}.`)}function __PRIVATE_valueDescription(e){if(void 0===e)return"undefined";if(null===e)return"null";if("string"==typeof e)return e.length>20&&(e=`${e.substring(0,20)}...`),JSON.stringify(e);if("number"==typeof e||"boolean"==typeof e)return""+e;if("object"==typeof e){if(e instanceof Array)return"an array";{const s=(i=e).constructor?i.constructor.name:null;return s?`a custom ${s} object`:"an object"}}var i;return"function"==typeof e?"a function":fail()}function __PRIVATE_cast(e,i){if("_delegate"in e&&(e=e._delegate),!(e instanceof i)){if(i.name===e.constructor.name)throw new FirestoreError(Nt.INVALID_ARGUMENT,"Type does not match the expected instance. Did you pass a reference from a different Firestore SDK?");{const s=__PRIVATE_valueDescription(e);throw new FirestoreError(Nt.INVALID_ARGUMENT,`Expected type '${i.name}', but it was: ${s}`)}}return e}
/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
class FirestoreSettingsImpl{constructor(e){var i,s;if(void 0===e.host){if(void 0!==e.ssl)throw new FirestoreError(Nt.INVALID_ARGUMENT,"Can't provide ssl option if host option is not set");this.host="firestore.googleapis.com",this.ssl=!0}else this.host=e.host,this.ssl=null===(i=e.ssl)||void 0===i||i;if(this.credentials=e.credentials,this.ignoreUndefinedProperties=!!e.ignoreUndefinedProperties,this.localCache=e.localCache,void 0===e.cacheSizeBytes)this.cacheSizeBytes=41943040;else{if(-1!==e.cacheSizeBytes&&e.cacheSizeBytes<1048576)throw new FirestoreError(Nt.INVALID_ARGUMENT,"cacheSizeBytes must be at least 1048576");this.cacheSizeBytes=e.cacheSizeBytes}(function(e,i,s,o){if(!0===i&&!0===o)throw new FirestoreError(Nt.INVALID_ARGUMENT,`${e} and ${s} cannot be used together.`)})("experimentalForceLongPolling",e.experimentalForceLongPolling,"experimentalAutoDetectLongPolling",e.experimentalAutoDetectLongPolling),this.experimentalForceLongPolling=!!e.experimentalForceLongPolling,this.experimentalForceLongPolling?this.experimentalAutoDetectLongPolling=!1:void 0===e.experimentalAutoDetectLongPolling?this.experimentalAutoDetectLongPolling=!0:this.experimentalAutoDetectLongPolling=!!e.experimentalAutoDetectLongPolling,this.experimentalLongPollingOptions=__PRIVATE_cloneLongPollingOptions(null!==(s=e.experimentalLongPollingOptions)&&void 0!==s?s:{}),function(e){if(void 0!==e.timeoutSeconds){if(isNaN(e.timeoutSeconds))throw new FirestoreError(Nt.INVALID_ARGUMENT,`invalid long polling timeout: ${e.timeoutSeconds} (must not be NaN)`);if(e.timeoutSeconds<5)throw new FirestoreError(Nt.INVALID_ARGUMENT,`invalid long polling timeout: ${e.timeoutSeconds} (minimum allowed value is 5)`);if(e.timeoutSeconds>30)throw new FirestoreError(Nt.INVALID_ARGUMENT,`invalid long polling timeout: ${e.timeoutSeconds} (maximum allowed value is 30)`)}}(this.experimentalLongPollingOptions),this.useFetchStreams=!!e.useFetchStreams}isEqual(e){return this.host===e.host&&this.ssl===e.ssl&&this.credentials===e.credentials&&this.cacheSizeBytes===e.cacheSizeBytes&&this.experimentalForceLongPolling===e.experimentalForceLongPolling&&this.experimentalAutoDetectLongPolling===e.experimentalAutoDetectLongPolling&&(i=this.experimentalLongPollingOptions,s=e.experimentalLongPollingOptions,i.timeoutSeconds===s.timeoutSeconds)&&this.ignoreUndefinedProperties===e.ignoreUndefinedProperties&&this.useFetchStreams===e.useFetchStreams;var i,s}}class Firestore$1{constructor(e,i,s,o){this._authCredentials=e,this._appCheckCredentials=i,this._databaseId=s,this._app=o,this.type="firestore-lite",this._persistenceKey="(lite)",this._settings=new FirestoreSettingsImpl({}),this._settingsFrozen=!1,this._terminateTask="notTerminated"}get app(){if(!this._app)throw new FirestoreError(Nt.FAILED_PRECONDITION,"Firestore was not initialized using the Firebase SDK. 'app' is not available");return this._app}get _initialized(){return this._settingsFrozen}get _terminated(){return"notTerminated"!==this._terminateTask}_setSettings(e){if(this._settingsFrozen)throw new FirestoreError(Nt.FAILED_PRECONDITION,"Firestore has already been started and its settings can no longer be changed. You can only modify settings before calling any other methods on a Firestore object.");this._settings=new FirestoreSettingsImpl(e),void 0!==e.credentials&&(this._authCredentials=function(e){if(!e)return new __PRIVATE_EmptyAuthCredentialsProvider;switch(e.type){case"firstParty":return new __PRIVATE_FirstPartyAuthCredentialsProvider(e.sessionIndex||"0",e.iamToken||null,e.authTokenFactory||null);case"provider":return e.client;default:throw new FirestoreError(Nt.INVALID_ARGUMENT,"makeAuthCredentialsProvider failed due to invalid credential type")}}(e.credentials))}_getSettings(){return this._settings}_freezeSettings(){return this._settingsFrozen=!0,this._settings}_delete(){return"notTerminated"===this._terminateTask&&(this._terminateTask=this._terminate()),this._terminateTask}async _restart(){"notTerminated"===this._terminateTask?await this._terminate():this._terminateTask="notTerminated"}toJSON(){return{app:this._app,databaseId:this._databaseId,settings:this._settings}}_terminate(){return function(e){const i=Zt.get(e);i&&(__PRIVATE_logDebug("ComponentProvider","Removing Datastore"),Zt.delete(e),i.terminate())}(this),Promise.resolve()}}function connectFirestoreEmulator(e,i,s,o={}){var l;const h=(e=__PRIVATE_cast(e,Firestore$1))._getSettings(),d=`${i}:${s}`;if("firestore.googleapis.com"!==h.host&&h.host!==d&&__PRIVATE_logWarn("Host has been set in both settings() and connectFirestoreEmulator(), emulator host will be used."),e._setSettings(Object.assign(Object.assign({},h),{host:d,ssl:!1})),o.mockUserToken){let i,s;if("string"==typeof o.mockUserToken)i=o.mockUserToken,s=User.MOCK_USER;else{i=createMockUserToken(o.mockUserToken,null===(l=e._app)||void 0===l?void 0:l.options.projectId);const h=o.mockUserToken.sub||o.mockUserToken.user_id;if(!h)throw new FirestoreError(Nt.INVALID_ARGUMENT,"mockUserToken must contain 'sub' or 'user_id' field!");s=new User(h)}e._authCredentials=new __PRIVATE_EmulatorAuthCredentialsProvider(new __PRIVATE_OAuthToken(i,s))}}
/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Query{constructor(e,i,s){this.converter=i,this._query=s,this.type="query",this.firestore=e}withConverter(e){return new Query(this.firestore,e,this._query)}}class DocumentReference{constructor(e,i,s){this.converter=i,this._key=s,this.type="document",this.firestore=e}get _path(){return this._key.path}get id(){return this._key.path.lastSegment()}get path(){return this._key.path.canonicalString()}get parent(){return new CollectionReference(this.firestore,this.converter,this._key.path.popLast())}withConverter(e){return new DocumentReference(this.firestore,e,this._key)}}class CollectionReference extends Query{constructor(e,i,s){super(e,i,__PRIVATE_newQueryForPath(s)),this._path=s,this.type="collection"}get id(){return this._query.path.lastSegment()}get path(){return this._query.path.canonicalString()}get parent(){const e=this._path.popLast();return e.isEmpty()?null:new DocumentReference(this.firestore,null,new DocumentKey(e))}withConverter(e){return new CollectionReference(this.firestore,e,this._path)}}function collection(e,i,...s){if(e=getModularInstance(e),__PRIVATE_validateNonEmptyArgument("collection","path",i),e instanceof Firestore$1){const o=ResourcePath.fromString(i,...s);return __PRIVATE_validateCollectionPath(o),new CollectionReference(e,null,o)}{if(!(e instanceof DocumentReference||e instanceof CollectionReference))throw new FirestoreError(Nt.INVALID_ARGUMENT,"Expected first argument to collection() to be a CollectionReference, a DocumentReference or FirebaseFirestore");const o=e._path.child(ResourcePath.fromString(i,...s));return __PRIVATE_validateCollectionPath(o),new CollectionReference(e.firestore,null,o)}}function doc(e,i,...s){if(e=getModularInstance(e),1===arguments.length&&(i=__PRIVATE_AutoId.newId()),__PRIVATE_validateNonEmptyArgument("doc","path",i),e instanceof Firestore$1){const o=ResourcePath.fromString(i,...s);return __PRIVATE_validateDocumentPath(o),new DocumentReference(e,null,new DocumentKey(o))}{if(!(e instanceof DocumentReference||e instanceof CollectionReference))throw new FirestoreError(Nt.INVALID_ARGUMENT,"Expected first argument to collection() to be a CollectionReference, a DocumentReference or FirebaseFirestore");const o=e._path.child(ResourcePath.fromString(i,...s));return __PRIVATE_validateDocumentPath(o),new DocumentReference(e.firestore,e instanceof CollectionReference?e.converter:null,new DocumentKey(o))}}
/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class __PRIVATE_AsyncQueueImpl{constructor(e=Promise.resolve()){this.Pu=[],this.Iu=!1,this.Tu=[],this.Eu=null,this.du=!1,this.Au=!1,this.Ru=[],this.t_=new __PRIVATE_ExponentialBackoff(this,"async_queue_retry"),this.Vu=()=>{const e=getDocument();e&&__PRIVATE_logDebug("AsyncQueue","Visibility state changed to "+e.visibilityState),this.t_.jo()},this.mu=e;const i=getDocument();i&&"function"==typeof i.addEventListener&&i.addEventListener("visibilitychange",this.Vu)}get isShuttingDown(){return this.Iu}enqueueAndForget(e){this.enqueue(e)}enqueueAndForgetEvenWhileRestricted(e){this.fu(),this.gu(e)}enterRestrictedMode(e){if(!this.Iu){this.Iu=!0,this.Au=e||!1;const i=getDocument();i&&"function"==typeof i.removeEventListener&&i.removeEventListener("visibilitychange",this.Vu)}}enqueue(e){if(this.fu(),this.Iu)return new Promise(()=>{});const i=new __PRIVATE_Deferred;return this.gu(()=>this.Iu&&this.Au?Promise.resolve():(e().then(i.resolve,i.reject),i.promise)).then(()=>i.promise)}enqueueRetryable(e){this.enqueueAndForget(()=>(this.Pu.push(e),this.pu()))}async pu(){if(0!==this.Pu.length){try{await this.Pu[0](),this.Pu.shift(),this.t_.reset()}catch(e){if(!__PRIVATE_isIndexedDbTransactionError(e))throw e;__PRIVATE_logDebug("AsyncQueue","Operation failed with retryable error: "+e)}this.Pu.length>0&&this.t_.Go(()=>this.pu())}}gu(e){const i=this.mu.then(()=>(this.du=!0,e().catch(e=>{this.Eu=e,this.du=!1;throw __PRIVATE_logError("INTERNAL UNHANDLED ERROR: ",function(e){let i=e.message||"";return e.stack&&(i=e.stack.includes(e.message)?e.stack:e.message+"\n"+e.stack),i}(e)),e}).then(e=>(this.du=!1,e))));return this.mu=i,i}enqueueAfterDelay(e,i,s){this.fu(),this.Ru.indexOf(e)>-1&&(i=0);const o=DelayedOperation.createAndSchedule(this,e,i,s,e=>this.yu(e));return this.Tu.push(o),o}fu(){this.Eu&&fail()}verifyOperationInProgress(){}async wu(){let e;do{e=this.mu,await e}while(e!==this.mu)}Su(e){for(const i of this.Tu)if(i.timerId===e)return!0;return!1}bu(e){return this.wu().then(()=>{this.Tu.sort((e,i)=>e.targetTimeMs-i.targetTimeMs);for(const i of this.Tu)if(i.skipDelay(),"all"!==e&&i.timerId===e)break;return this.wu()})}Du(e){this.Ru.push(e)}yu(e){const i=this.Tu.indexOf(e);this.Tu.splice(i,1)}}function __PRIVATE_isPartialObserver(e){return function(e,i){if("object"!=typeof e||null===e)return!1;const s=e;for(const o of i)if(o in s&&"function"==typeof s[o])return!0;return!1}(e,["next","error","complete"])}class Firestore extends Firestore$1{constructor(e,i,s,o){super(e,i,s,o),this.type="firestore",this._queue=new __PRIVATE_AsyncQueueImpl,this._persistenceKey=(null==o?void 0:o.name)||"[DEFAULT]"}async _terminate(){if(this._firestoreClient){const e=this._firestoreClient.terminate();this._queue=new __PRIVATE_AsyncQueueImpl(e),this._firestoreClient=void 0,await e}}}function getFirestore(e,i){const s="string"==typeof e?e:i||"(default)",o=_getProvider("object"==typeof e?e:getApp(),"firestore").getImmediate({identifier:s});if(!o._initialized){const e=getDefaultEmulatorHostnameAndPort("firestore");e&&connectFirestoreEmulator(o,...e)}return o}function ensureFirestoreConfigured(e){if(e._terminated)throw new FirestoreError(Nt.FAILED_PRECONDITION,"The client has already been terminated.");return e._firestoreClient||function(e){var i,s,o;const l=e._freezeSettings(),h=(d=e._databaseId,_=(null===(i=e._app)||void 0===i?void 0:i.options.appId)||"",f=e._persistenceKey,g=l,new DatabaseInfo(d,_,f,g.host,g.ssl,g.experimentalForceLongPolling,g.experimentalAutoDetectLongPolling,__PRIVATE_cloneLongPollingOptions(g.experimentalLongPollingOptions),g.useFetchStreams));var d,_,f,g;e._componentsProvider||(null===(s=l.localCache)||void 0===s?void 0:s._offlineComponentProvider)&&(null===(o=l.localCache)||void 0===o?void 0:o._onlineComponentProvider)&&(e._componentsProvider={_offline:l.localCache._offlineComponentProvider,_online:l.localCache._onlineComponentProvider}),e._firestoreClient=new FirestoreClient(e._authCredentials,e._appCheckCredentials,e._queue,h,e._componentsProvider&&function(e){const i=null==e?void 0:e._online.build();return{_offline:null==e?void 0:e._offline.build(i),_online:i}}(e._componentsProvider))}
/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */(e),e._firestoreClient}class Bytes{constructor(e){this._byteString=e}static fromBase64String(e){try{return new Bytes(ByteString.fromBase64String(e))}catch(i){throw new FirestoreError(Nt.INVALID_ARGUMENT,"Failed to construct data from Base64 string: "+i)}}static fromUint8Array(e){return new Bytes(ByteString.fromUint8Array(e))}toBase64(){return this._byteString.toBase64()}toUint8Array(){return this._byteString.toUint8Array()}toString(){return"Bytes(base64: "+this.toBase64()+")"}isEqual(e){return this._byteString.isEqual(e._byteString)}}
/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class FieldPath{constructor(...e){for(let i=0;i<e.length;++i)if(0===e[i].length)throw new FirestoreError(Nt.INVALID_ARGUMENT,"Invalid field name at argument $(i + 1). Field names must not be empty.");this._internalPath=new FieldPath$1(e)}isEqual(e){return this._internalPath.isEqual(e._internalPath)}}
/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class FieldValue{constructor(e){this._methodName=e}}
/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class GeoPoint{constructor(e,i){if(!isFinite(e)||e<-90||e>90)throw new FirestoreError(Nt.INVALID_ARGUMENT,"Latitude must be a number between -90 and 90, but was: "+e);if(!isFinite(i)||i<-180||i>180)throw new FirestoreError(Nt.INVALID_ARGUMENT,"Longitude must be a number between -180 and 180, but was: "+i);this._lat=e,this._long=i}get latitude(){return this._lat}get longitude(){return this._long}isEqual(e){return this._lat===e._lat&&this._long===e._long}toJSON(){return{latitude:this._lat,longitude:this._long}}_compareTo(e){return __PRIVATE_primitiveComparator(this._lat,e._lat)||__PRIVATE_primitiveComparator(this._long,e._long)}}
/**
 * @license
 * Copyright 2024 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class VectorValue{constructor(e){this._values=(e||[]).map(e=>e)}toArray(){return this._values.map(e=>e)}isEqual(e){return function(e,i){if(e.length!==i.length)return!1;for(let s=0;s<e.length;++s)if(e[s]!==i[s])return!1;return!0}(this._values,e._values)}}
/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const er=/^__.*__$/;class ParsedSetData{constructor(e,i,s){this.data=e,this.fieldMask=i,this.fieldTransforms=s}toMutation(e,i){return null!==this.fieldMask?new __PRIVATE_PatchMutation(e,this.data,this.fieldMask,i,this.fieldTransforms):new __PRIVATE_SetMutation(e,this.data,i,this.fieldTransforms)}}class ParsedUpdateData{constructor(e,i,s){this.data=e,this.fieldMask=i,this.fieldTransforms=s}toMutation(e,i){return new __PRIVATE_PatchMutation(e,this.data,this.fieldMask,i,this.fieldTransforms)}}function __PRIVATE_isWrite(e){switch(e){case 0:case 2:case 1:return!0;case 3:case 4:return!1;default:throw fail()}}class __PRIVATE_ParseContextImpl{constructor(e,i,s,o,l,h){this.settings=e,this.databaseId=i,this.serializer=s,this.ignoreUndefinedProperties=o,void 0===l&&this.vu(),this.fieldTransforms=l||[],this.fieldMask=h||[]}get path(){return this.settings.path}get Cu(){return this.settings.Cu}Fu(e){return new __PRIVATE_ParseContextImpl(Object.assign(Object.assign({},this.settings),e),this.databaseId,this.serializer,this.ignoreUndefinedProperties,this.fieldTransforms,this.fieldMask)}Mu(e){var i;const s=null===(i=this.path)||void 0===i?void 0:i.child(e),o=this.Fu({path:s,xu:!1});return o.Ou(e),o}Nu(e){var i;const s=null===(i=this.path)||void 0===i?void 0:i.child(e),o=this.Fu({path:s,xu:!1});return o.vu(),o}Lu(e){return this.Fu({path:void 0,xu:!0})}Bu(e){return __PRIVATE_createError(e,this.settings.methodName,this.settings.ku||!1,this.path,this.settings.qu)}contains(e){return void 0!==this.fieldMask.find(i=>e.isPrefixOf(i))||void 0!==this.fieldTransforms.find(i=>e.isPrefixOf(i.field))}vu(){if(this.path)for(let e=0;e<this.path.length;e++)this.Ou(this.path.get(e))}Ou(e){if(0===e.length)throw this.Bu("Document fields must not be empty");if(__PRIVATE_isWrite(this.Cu)&&er.test(e))throw this.Bu('Document fields cannot begin and end with "__"')}}class __PRIVATE_UserDataReader{constructor(e,i,s){this.databaseId=e,this.ignoreUndefinedProperties=i,this.serializer=s||__PRIVATE_newSerializer(e)}Qu(e,i,s,o=!1){return new __PRIVATE_ParseContextImpl({Cu:e,methodName:i,qu:s,path:FieldPath$1.emptyPath(),xu:!1,ku:o},this.databaseId,this.serializer,this.ignoreUndefinedProperties)}}function __PRIVATE_newUserDataReader(e){const i=e._freezeSettings(),s=__PRIVATE_newSerializer(e._databaseId);return new __PRIVATE_UserDataReader(e._databaseId,!!i.ignoreUndefinedProperties,s)}function __PRIVATE_parseSetData(e,i,s,o,l,h={}){const d=e.Qu(h.merge||h.mergeFields?2:0,i,s,l);__PRIVATE_validatePlainObject("Data must be an object, but it was:",d,o);const _=__PRIVATE_parseObject(o,d);let f,g;if(h.merge)f=new FieldMask(d.fieldMask),g=d.fieldTransforms;else if(h.mergeFields){const e=[];for(const o of h.mergeFields){const l=__PRIVATE_fieldPathFromArgument$1(i,o,s);if(!d.contains(l))throw new FirestoreError(Nt.INVALID_ARGUMENT,`Field '${l}' is specified in your field mask but missing from your input data.`);__PRIVATE_fieldMaskContains(e,l)||e.push(l)}f=new FieldMask(e),g=d.fieldTransforms.filter(e=>f.covers(e.field))}else f=null,g=d.fieldTransforms;return new ParsedSetData(new ObjectValue(_),f,g)}class __PRIVATE_DeleteFieldValueImpl extends FieldValue{_toFieldTransform(e){if(2!==e.Cu)throw 1===e.Cu?e.Bu(`${this._methodName}() can only appear at the top level of your update data`):e.Bu(`${this._methodName}() cannot be used with set() unless you pass {merge:true}`);return e.fieldMask.push(e.path),null}isEqual(e){return e instanceof __PRIVATE_DeleteFieldValueImpl}}class __PRIVATE_ServerTimestampFieldValueImpl extends FieldValue{_toFieldTransform(e){return new FieldTransform(e.path,new __PRIVATE_ServerTimestampTransform)}isEqual(e){return e instanceof __PRIVATE_ServerTimestampFieldValueImpl}}function __PRIVATE_parseUpdateData(e,i,s,o){const l=e.Qu(1,i,s);__PRIVATE_validatePlainObject("Data must be an object, but it was:",l,o);const h=[],d=ObjectValue.empty();forEach(o,(e,o)=>{const _=__PRIVATE_fieldPathFromDotSeparatedString(i,e,s);o=getModularInstance(o);const f=l.Nu(_);if(o instanceof __PRIVATE_DeleteFieldValueImpl)h.push(_);else{const e=__PRIVATE_parseData(o,f);null!=e&&(h.push(_),d.set(_,e))}});const _=new FieldMask(h);return new ParsedUpdateData(d,_,l.fieldTransforms)}function __PRIVATE_parseUpdateVarargs(e,i,s,o,l,h){const d=e.Qu(1,i,s),_=[__PRIVATE_fieldPathFromArgument$1(i,o,s)],f=[l];if(h.length%2!=0)throw new FirestoreError(Nt.INVALID_ARGUMENT,`Function ${i}() needs to be called with an even number of arguments that alternate between field names and values.`);for(let b=0;b<h.length;b+=2)_.push(__PRIVATE_fieldPathFromArgument$1(i,h[b])),f.push(h[b+1]);const g=[],v=ObjectValue.empty();for(let b=_.length-1;b>=0;--b)if(!__PRIVATE_fieldMaskContains(g,_[b])){const e=_[b];let i=f[b];i=getModularInstance(i);const s=d.Nu(e);if(i instanceof __PRIVATE_DeleteFieldValueImpl)g.push(e);else{const o=__PRIVATE_parseData(i,s);null!=o&&(g.push(e),v.set(e,o))}}const w=new FieldMask(g);return new ParsedUpdateData(v,w,d.fieldTransforms)}function __PRIVATE_parseData(e,i){if(__PRIVATE_looksLikeJsonObject(e=getModularInstance(e)))return __PRIVATE_validatePlainObject("Unsupported field value:",i,e),__PRIVATE_parseObject(e,i);if(e instanceof FieldValue)return function(e,i){if(!__PRIVATE_isWrite(i.Cu))throw i.Bu(`${e._methodName}() can only be used with update() and set()`);if(!i.path)throw i.Bu(`${e._methodName}() is not currently supported inside arrays`);const s=e._toFieldTransform(i);s&&i.fieldTransforms.push(s)}(e,i),null;if(void 0===e&&i.ignoreUndefinedProperties)return null;if(i.path&&i.fieldMask.push(i.path),e instanceof Array){if(i.settings.xu&&4!==i.Cu)throw i.Bu("Nested arrays are not supported");return function(e,i){const s=[];let o=0;for(const l of e){let e=__PRIVATE_parseData(l,i.Lu(o));null==e&&(e={nullValue:"NULL_VALUE"}),s.push(e),o++}return{arrayValue:{values:s}}}(e,i)}return function(e,i){if(null===(e=getModularInstance(e)))return{nullValue:"NULL_VALUE"};if("number"==typeof e)return toNumber(i.serializer,e);if("boolean"==typeof e)return{booleanValue:e};if("string"==typeof e)return{stringValue:e};if(e instanceof Date){const s=Timestamp.fromDate(e);return{timestampValue:toTimestamp(i.serializer,s)}}if(e instanceof Timestamp){const s=new Timestamp(e.seconds,1e3*Math.floor(e.nanoseconds/1e3));return{timestampValue:toTimestamp(i.serializer,s)}}if(e instanceof GeoPoint)return{geoPointValue:{latitude:e.latitude,longitude:e.longitude}};if(e instanceof Bytes)return{bytesValue:__PRIVATE_toBytes(i.serializer,e._byteString)};if(e instanceof DocumentReference){const s=i.databaseId,o=e.firestore._databaseId;if(!o.isEqual(s))throw i.Bu(`Document reference is for database ${o.projectId}/${o.database} but should be for database ${s.projectId}/${s.database}`);return{referenceValue:__PRIVATE_toResourceName(e.firestore._databaseId||i.databaseId,e._key.path)}}if(e instanceof VectorValue)return s=i,{mapValue:{fields:{__type__:{stringValue:"__vector__"},value:{arrayValue:{values:e.toArray().map(e=>{if("number"!=typeof e)throw s.Bu("VectorValues must only contain numeric values.");return __PRIVATE_toDouble(s.serializer,e)})}}}}};var s;throw i.Bu(`Unsupported field value: ${__PRIVATE_valueDescription(e)}`)}(e,i)}function __PRIVATE_parseObject(e,i){const s={};return isEmpty(e)?i.path&&i.path.length>0&&i.fieldMask.push(i.path):forEach(e,(e,o)=>{const l=__PRIVATE_parseData(o,i.Mu(e));null!=l&&(s[e]=l)}),{mapValue:{fields:s}}}function __PRIVATE_looksLikeJsonObject(e){return!("object"!=typeof e||null===e||e instanceof Array||e instanceof Date||e instanceof Timestamp||e instanceof GeoPoint||e instanceof Bytes||e instanceof DocumentReference||e instanceof FieldValue||e instanceof VectorValue)}function __PRIVATE_validatePlainObject(e,i,s){if(!__PRIVATE_looksLikeJsonObject(s)||("object"!=typeof(o=s)||null===o||Object.getPrototypeOf(o)!==Object.prototype&&null!==Object.getPrototypeOf(o))){const o=__PRIVATE_valueDescription(s);throw"an object"===o?i.Bu(e+" a custom object"):i.Bu(e+" "+o)}var o}function __PRIVATE_fieldPathFromArgument$1(e,i,s){if((i=getModularInstance(i))instanceof FieldPath)return i._internalPath;if("string"==typeof i)return __PRIVATE_fieldPathFromDotSeparatedString(e,i);throw __PRIVATE_createError("Field path arguments must be of type string or ",e,!1,void 0,s)}const tr=new RegExp("[~\\*/\\[\\]]");function __PRIVATE_fieldPathFromDotSeparatedString(e,i,s){if(i.search(tr)>=0)throw __PRIVATE_createError(`Invalid field path (${i}). Paths must not contain '~', '*', '/', '[', or ']'`,e,!1,void 0,s);try{return new FieldPath(...i.split("."))._internalPath}catch(o){throw __PRIVATE_createError(`Invalid field path (${i}). Paths must not be empty, begin with '.', end with '.', or contain '..'`,e,!1,void 0,s)}}function __PRIVATE_createError(e,i,s,o,l){const h=o&&!o.isEmpty(),d=void 0!==l;let _=`Function ${i}() called with invalid data`;s&&(_+=" (via `toFirestore()`)"),_+=". ";let f="";return(h||d)&&(f+=" (found",h&&(f+=` in field ${o}`),d&&(f+=` in document ${l}`),f+=")"),new FirestoreError(Nt.INVALID_ARGUMENT,_+e+f)}function __PRIVATE_fieldMaskContains(e,i){return e.some(e=>e.isEqual(i))}
/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class DocumentSnapshot$1{constructor(e,i,s,o,l){this._firestore=e,this._userDataWriter=i,this._key=s,this._document=o,this._converter=l}get id(){return this._key.path.lastSegment()}get ref(){return new DocumentReference(this._firestore,this._converter,this._key)}exists(){return null!==this._document}data(){if(this._document){if(this._converter){const e=new QueryDocumentSnapshot$1(this._firestore,this._userDataWriter,this._key,this._document,null);return this._converter.fromFirestore(e)}return this._userDataWriter.convertValue(this._document.data.value)}}get(e){if(this._document){const i=this._document.data.field(__PRIVATE_fieldPathFromArgument("DocumentSnapshot.get",e));if(null!==i)return this._userDataWriter.convertValue(i)}}}class QueryDocumentSnapshot$1 extends DocumentSnapshot$1{data(){return super.data()}}function __PRIVATE_fieldPathFromArgument(e,i){return"string"==typeof i?__PRIVATE_fieldPathFromDotSeparatedString(e,i):i instanceof FieldPath?i._internalPath:i._delegate._internalPath}
/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function __PRIVATE_validateHasExplicitOrderByForLimitToLast(e){if("L"===e.limitType&&0===e.explicitOrderBy.length)throw new FirestoreError(Nt.UNIMPLEMENTED,"limitToLast() queries require specifying at least one orderBy() clause")}class AppliableConstraint{}class QueryConstraint extends AppliableConstraint{}function query(e,i,...s){let o=[];i instanceof AppliableConstraint&&o.push(i),o=o.concat(s),function(e){const i=e.filter(e=>e instanceof QueryCompositeFilterConstraint).length,s=e.filter(e=>e instanceof QueryFieldFilterConstraint).length;if(i>1||i>0&&s>0)throw new FirestoreError(Nt.INVALID_ARGUMENT,"InvalidQuery. When using composite filters, you cannot use more than one filter at the top level. Consider nesting the multiple filters within an `and(...)` statement. For example: change `query(query, where(...), or(...))` to `query(query, and(where(...), or(...)))`.")}(o);for(const l of o)e=l._apply(e);return e}class QueryFieldFilterConstraint extends QueryConstraint{constructor(e,i,s){super(),this._field=e,this._op=i,this._value=s,this.type="where"}static _create(e,i,s){return new QueryFieldFilterConstraint(e,i,s)}_apply(e){const i=this._parse(e);return __PRIVATE_validateNewFieldFilter(e._query,i),new Query(e.firestore,e.converter,__PRIVATE_queryWithAddedFilter(e._query,i))}_parse(e){const i=__PRIVATE_newUserDataReader(e.firestore),s=function(e,i,s,o,l,h,d){let _;if(l.isKeyField()){if("array-contains"===h||"array-contains-any"===h)throw new FirestoreError(Nt.INVALID_ARGUMENT,`Invalid Query. You can't perform '${h}' queries on documentId().`);if("in"===h||"not-in"===h){__PRIVATE_validateDisjunctiveFilterElements(d,h);const i=[];for(const s of d)i.push(__PRIVATE_parseDocumentIdValue(o,e,s));_={arrayValue:{values:i}}}else _=__PRIVATE_parseDocumentIdValue(o,e,d)}else"in"!==h&&"not-in"!==h&&"array-contains-any"!==h||__PRIVATE_validateDisjunctiveFilterElements(d,h),_=function(e,i,s,o=!1){return __PRIVATE_parseData(s,e.Qu(o?4:3,i))}(s,i,d,"in"===h||"not-in"===h);return FieldFilter.create(l,h,_)}(e._query,"where",i,e.firestore._databaseId,this._field,this._op,this._value);return s}}function where(e,i,s){const o=i,l=__PRIVATE_fieldPathFromArgument("where",e);return QueryFieldFilterConstraint._create(l,o,s)}class QueryCompositeFilterConstraint extends AppliableConstraint{constructor(e,i){super(),this.type=e,this._queryConstraints=i}static _create(e,i){return new QueryCompositeFilterConstraint(e,i)}_parse(e){const i=this._queryConstraints.map(i=>i._parse(e)).filter(e=>e.getFilters().length>0);return 1===i.length?i[0]:CompositeFilter.create(i,this._getOperator())}_apply(e){const i=this._parse(e);return 0===i.getFilters().length?e:(function(e,i){let s=e;const o=i.getFlattenedFilters();for(const l of o)__PRIVATE_validateNewFieldFilter(s,l),s=__PRIVATE_queryWithAddedFilter(s,l)}(e._query,i),new Query(e.firestore,e.converter,__PRIVATE_queryWithAddedFilter(e._query,i)))}_getQueryConstraints(){return this._queryConstraints}_getOperator(){return"and"===this.type?"and":"or"}}class QueryOrderByConstraint extends QueryConstraint{constructor(e,i){super(),this._field=e,this._direction=i,this.type="orderBy"}static _create(e,i){return new QueryOrderByConstraint(e,i)}_apply(e){const i=function(e,i,s){if(null!==e.startAt)throw new FirestoreError(Nt.INVALID_ARGUMENT,"Invalid query. You must not call startAt() or startAfter() before calling orderBy().");if(null!==e.endAt)throw new FirestoreError(Nt.INVALID_ARGUMENT,"Invalid query. You must not call endAt() or endBefore() before calling orderBy().");return new OrderBy(i,s)}(e._query,this._field,this._direction);return new Query(e.firestore,e.converter,function(e,i){const s=e.explicitOrderBy.concat([i]);return new __PRIVATE_QueryImpl(e.path,e.collectionGroup,s,e.filters.slice(),e.limit,e.limitType,e.startAt,e.endAt)}(e._query,i))}}function orderBy(e,i="asc"){const s=i,o=__PRIVATE_fieldPathFromArgument("orderBy",e);return QueryOrderByConstraint._create(o,s)}class QueryLimitConstraint extends QueryConstraint{constructor(e,i,s){super(),this.type=e,this._limit=i,this._limitType=s}static _create(e,i,s){return new QueryLimitConstraint(e,i,s)}_apply(e){return new Query(e.firestore,e.converter,__PRIVATE_queryWithLimit(e._query,this._limit,this._limitType))}}function limit(e){return function(e,i){if(i<=0)throw new FirestoreError(Nt.INVALID_ARGUMENT,`Function ${e}() requires a positive number, but it was: ${i}.`)}("limit",e),QueryLimitConstraint._create("limit",e,"F")}function __PRIVATE_parseDocumentIdValue(e,i,s){if("string"==typeof(s=getModularInstance(s))){if(""===s)throw new FirestoreError(Nt.INVALID_ARGUMENT,"Invalid query. When querying with documentId(), you must provide a valid document ID, but it was an empty string.");if(!__PRIVATE_isCollectionGroupQuery(i)&&-1!==s.indexOf("/"))throw new FirestoreError(Nt.INVALID_ARGUMENT,`Invalid query. When querying a collection by documentId(), you must provide a plain document ID, but '${s}' contains a '/' character.`);const o=i.path.child(ResourcePath.fromString(s));if(!DocumentKey.isDocumentKey(o))throw new FirestoreError(Nt.INVALID_ARGUMENT,`Invalid query. When querying a collection group by documentId(), the value provided must result in a valid document path, but '${o}' is not because it has an odd number of segments (${o.length}).`);return __PRIVATE_refValue(e,new DocumentKey(o))}if(s instanceof DocumentReference)return __PRIVATE_refValue(e,s._key);throw new FirestoreError(Nt.INVALID_ARGUMENT,`Invalid query. When querying with documentId(), you must provide a valid string or a DocumentReference, but it was: ${__PRIVATE_valueDescription(s)}.`)}function __PRIVATE_validateDisjunctiveFilterElements(e,i){if(!Array.isArray(e)||0===e.length)throw new FirestoreError(Nt.INVALID_ARGUMENT,`Invalid Query. A non-empty array is required for '${i.toString()}' filters.`)}function __PRIVATE_validateNewFieldFilter(e,i){const s=function(e,i){for(const s of e)for(const e of s.getFlattenedFilters())if(i.indexOf(e.op)>=0)return e.op;return null}(e.filters,function(e){switch(e){case"!=":return["!=","not-in"];case"array-contains-any":case"in":return["not-in"];case"not-in":return["array-contains-any","in","not-in","!="];default:return[]}}(i.op));if(null!==s)throw s===i.op?new FirestoreError(Nt.INVALID_ARGUMENT,`Invalid query. You cannot use more than one '${i.op.toString()}' filter.`):new FirestoreError(Nt.INVALID_ARGUMENT,`Invalid query. You cannot use '${i.op.toString()}' filters with '${s.toString()}' filters.`)}class AbstractUserDataWriter{convertValue(e,i="none"){switch(__PRIVATE_typeOrder(e)){case 0:return null;case 1:return e.booleanValue;case 2:return __PRIVATE_normalizeNumber(e.integerValue||e.doubleValue);case 3:return this.convertTimestamp(e.timestampValue);case 4:return this.convertServerTimestamp(e,i);case 5:return e.stringValue;case 6:return this.convertBytes(__PRIVATE_normalizeByteString(e.bytesValue));case 7:return this.convertReference(e.referenceValue);case 8:return this.convertGeoPoint(e.geoPointValue);case 9:return this.convertArray(e.arrayValue,i);case 11:return this.convertObject(e.mapValue,i);case 10:return this.convertVectorValue(e.mapValue);default:throw fail()}}convertObject(e,i){return this.convertObjectMap(e.fields,i)}convertObjectMap(e,i="none"){const s={};return forEach(e,(e,o)=>{s[e]=this.convertValue(o,i)}),s}convertVectorValue(e){var i,s,o;const l=null===(o=null===(s=null===(i=e.fields)||void 0===i?void 0:i.value.arrayValue)||void 0===s?void 0:s.values)||void 0===o?void 0:o.map(e=>__PRIVATE_normalizeNumber(e.doubleValue));return new VectorValue(l)}convertGeoPoint(e){return new GeoPoint(__PRIVATE_normalizeNumber(e.latitude),__PRIVATE_normalizeNumber(e.longitude))}convertArray(e,i){return(e.values||[]).map(e=>this.convertValue(e,i))}convertServerTimestamp(e,i){switch(i){case"previous":const s=__PRIVATE_getPreviousValue(e);return null==s?null:this.convertValue(s,i);case"estimate":return this.convertTimestamp(__PRIVATE_getLocalWriteTime(e));default:return null}}convertTimestamp(e){const i=__PRIVATE_normalizeTimestamp(e);return new Timestamp(i.seconds,i.nanos)}convertDocumentKey(e,i){const s=ResourcePath.fromString(e);__PRIVATE_hardAssert(__PRIVATE_isValidResourceName(s));const o=new DatabaseId(s.get(1),s.get(3)),l=new DocumentKey(s.popFirst(5));return o.isEqual(i)||__PRIVATE_logError(`Document ${l} contains a document reference within a different database (${o.projectId}/${o.database}) which is not supported. It will be treated as a reference in the current database (${i.projectId}/${i.database}) instead.`),l}}
/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function __PRIVATE_applyFirestoreDataConverter(e,i,s){let o;return o=e?s&&(s.merge||s.mergeFields)?e.toFirestore(i,s):e.toFirestore(i):i,o
/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */}class SnapshotMetadata{constructor(e,i){this.hasPendingWrites=e,this.fromCache=i}isEqual(e){return this.hasPendingWrites===e.hasPendingWrites&&this.fromCache===e.fromCache}}class DocumentSnapshot extends DocumentSnapshot$1{constructor(e,i,s,o,l,h){super(e,i,s,o,h),this._firestore=e,this._firestoreImpl=e,this.metadata=l}exists(){return super.exists()}data(e={}){if(this._document){if(this._converter){const i=new QueryDocumentSnapshot(this._firestore,this._userDataWriter,this._key,this._document,this.metadata,null);return this._converter.fromFirestore(i,e)}return this._userDataWriter.convertValue(this._document.data.value,e.serverTimestamps)}}get(e,i={}){if(this._document){const s=this._document.data.field(__PRIVATE_fieldPathFromArgument("DocumentSnapshot.get",e));if(null!==s)return this._userDataWriter.convertValue(s,i.serverTimestamps)}}}class QueryDocumentSnapshot extends DocumentSnapshot{data(e={}){return super.data(e)}}class QuerySnapshot{constructor(e,i,s,o){this._firestore=e,this._userDataWriter=i,this._snapshot=o,this.metadata=new SnapshotMetadata(o.hasPendingWrites,o.fromCache),this.query=s}get docs(){const e=[];return this.forEach(i=>e.push(i)),e}get size(){return this._snapshot.docs.size}get empty(){return 0===this.size}forEach(e,i){this._snapshot.docs.forEach(s=>{e.call(i,new QueryDocumentSnapshot(this._firestore,this._userDataWriter,s.key,s,new SnapshotMetadata(this._snapshot.mutatedKeys.has(s.key),this._snapshot.fromCache),this.query.converter))})}docChanges(e={}){const i=!!e.includeMetadataChanges;if(i&&this._snapshot.excludesMetadataChanges)throw new FirestoreError(Nt.INVALID_ARGUMENT,"To include metadata changes with your document changes, you must also pass { includeMetadataChanges:true } to onSnapshot().");return this._cachedChanges&&this._cachedChangesIncludeMetadataChanges===i||(this._cachedChanges=function(e,i){if(e._snapshot.oldDocs.isEmpty()){let i=0;return e._snapshot.docChanges.map(s=>{const o=new QueryDocumentSnapshot(e._firestore,e._userDataWriter,s.doc.key,s.doc,new SnapshotMetadata(e._snapshot.mutatedKeys.has(s.doc.key),e._snapshot.fromCache),e.query.converter);return s.doc,{type:"added",doc:o,oldIndex:-1,newIndex:i++}})}{let s=e._snapshot.oldDocs;return e._snapshot.docChanges.filter(e=>i||3!==e.type).map(i=>{const o=new QueryDocumentSnapshot(e._firestore,e._userDataWriter,i.doc.key,i.doc,new SnapshotMetadata(e._snapshot.mutatedKeys.has(i.doc.key),e._snapshot.fromCache),e.query.converter);let l=-1,h=-1;return 0!==i.type&&(l=s.indexOf(i.doc.key),s=s.delete(i.doc.key)),1!==i.type&&(s=s.add(i.doc),h=s.indexOf(i.doc.key)),{type:__PRIVATE_resultChangeType(i.type),doc:o,oldIndex:l,newIndex:h}})}}(this,i),this._cachedChangesIncludeMetadataChanges=i),this._cachedChanges}}function __PRIVATE_resultChangeType(e){switch(e){case 0:return"added";case 2:case 3:return"modified";case 1:return"removed";default:return fail()}}
/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function getDoc(e){e=__PRIVATE_cast(e,DocumentReference);const i=__PRIVATE_cast(e.firestore,Firestore);return function(e,i,s={}){const o=new __PRIVATE_Deferred;return e.asyncQueue.enqueueAndForget(async()=>function(e,i,s,o,l){const h=new __PRIVATE_AsyncObserver({next:_=>{h.Za(),i.enqueueAndForget(()=>__PRIVATE_eventManagerUnlisten(e,d));const f=_.docs.has(s);!f&&_.fromCache?l.reject(new FirestoreError(Nt.UNAVAILABLE,"Failed to get document because the client is offline.")):f&&_.fromCache&&o&&"server"===o.source?l.reject(new FirestoreError(Nt.UNAVAILABLE,'Failed to get document from server. (However, this document does exist in the local cache. Run again without setting source to "server" to retrieve the cached document.)')):l.resolve(_)},error:e=>l.reject(e)}),d=new __PRIVATE_QueryListener(__PRIVATE_newQueryForPath(s.path),h,{includeMetadataChanges:!0,_a:!0});return __PRIVATE_eventManagerListen(e,d)}(await __PRIVATE_getEventManager(e),e.asyncQueue,i,s,o)),o.promise}(ensureFirestoreConfigured(i),e._key).then(s=>__PRIVATE_convertToDocSnapshot(i,e,s))}class __PRIVATE_ExpUserDataWriter extends AbstractUserDataWriter{constructor(e){super(),this.firestore=e}convertBytes(e){return new Bytes(e)}convertReference(e){const i=this.convertDocumentKey(e,this.firestore._databaseId);return new DocumentReference(this.firestore,null,i)}}function getDocs(e){e=__PRIVATE_cast(e,Query);const i=__PRIVATE_cast(e.firestore,Firestore),s=ensureFirestoreConfigured(i),o=new __PRIVATE_ExpUserDataWriter(i);return __PRIVATE_validateHasExplicitOrderByForLimitToLast(e._query),function(e,i,s={}){const o=new __PRIVATE_Deferred;return e.asyncQueue.enqueueAndForget(async()=>function(e,i,s,o,l){const h=new __PRIVATE_AsyncObserver({next:s=>{h.Za(),i.enqueueAndForget(()=>__PRIVATE_eventManagerUnlisten(e,d)),s.fromCache&&"server"===o.source?l.reject(new FirestoreError(Nt.UNAVAILABLE,'Failed to get documents from server. (However, these documents may exist in the local cache. Run again without setting source to "server" to retrieve the cached documents.)')):l.resolve(s)},error:e=>l.reject(e)}),d=new __PRIVATE_QueryListener(s,h,{includeMetadataChanges:!0,_a:!0});return __PRIVATE_eventManagerListen(e,d)}(await __PRIVATE_getEventManager(e),e.asyncQueue,i,s,o)),o.promise}(s,e._query).then(s=>new QuerySnapshot(i,o,e,s))}function setDoc(e,i,s){e=__PRIVATE_cast(e,DocumentReference);const o=__PRIVATE_cast(e.firestore,Firestore),l=__PRIVATE_applyFirestoreDataConverter(e.converter,i,s);return executeWrite(o,[__PRIVATE_parseSetData(__PRIVATE_newUserDataReader(o),"setDoc",e._key,l,null!==e.converter,s).toMutation(e._key,Precondition.none())])}function updateDoc(e,i,s,...o){e=__PRIVATE_cast(e,DocumentReference);const l=__PRIVATE_cast(e.firestore,Firestore),h=__PRIVATE_newUserDataReader(l);let d;return d="string"==typeof(i=getModularInstance(i))||i instanceof FieldPath?__PRIVATE_parseUpdateVarargs(h,"updateDoc",e._key,i,s,o):__PRIVATE_parseUpdateData(h,"updateDoc",e._key,i),executeWrite(l,[d.toMutation(e._key,Precondition.exists(!0))])}function deleteDoc(e){return executeWrite(__PRIVATE_cast(e.firestore,Firestore),[new __PRIVATE_DeleteMutation(e._key,Precondition.none())])}function onSnapshot(e,...i){var s,o,l;e=getModularInstance(e);let h={includeMetadataChanges:!1,source:"default"},d=0;"object"!=typeof i[d]||__PRIVATE_isPartialObserver(i[d])||(h=i[d],d++);const _={includeMetadataChanges:h.includeMetadataChanges,source:h.source};if(__PRIVATE_isPartialObserver(i[d])){const e=i[d];i[d]=null===(s=e.next)||void 0===s?void 0:s.bind(e),i[d+1]=null===(o=e.error)||void 0===o?void 0:o.bind(e),i[d+2]=null===(l=e.complete)||void 0===l?void 0:l.bind(e)}let f,g,v;if(e instanceof DocumentReference)g=__PRIVATE_cast(e.firestore,Firestore),v=__PRIVATE_newQueryForPath(e._key.path),f={next:s=>{i[d]&&i[d](__PRIVATE_convertToDocSnapshot(g,e,s))},error:i[d+1],complete:i[d+2]};else{const s=__PRIVATE_cast(e,Query);g=__PRIVATE_cast(s.firestore,Firestore),v=s._query;const o=new __PRIVATE_ExpUserDataWriter(g);f={next:e=>{i[d]&&i[d](new QuerySnapshot(g,o,s,e))},error:i[d+1],complete:i[d+2]},__PRIVATE_validateHasExplicitOrderByForLimitToLast(e._query)}return function(e,i,s,o){const l=new __PRIVATE_AsyncObserver(o),h=new __PRIVATE_QueryListener(i,l,s);return e.asyncQueue.enqueueAndForget(async()=>__PRIVATE_eventManagerListen(await __PRIVATE_getEventManager(e),h)),()=>{l.Za(),e.asyncQueue.enqueueAndForget(async()=>__PRIVATE_eventManagerUnlisten(await __PRIVATE_getEventManager(e),h))}}(ensureFirestoreConfigured(g),v,_,f)}function executeWrite(e,i){return function(e,i){const s=new __PRIVATE_Deferred;return e.asyncQueue.enqueueAndForget(async()=>__PRIVATE_syncEngineWrite(await function(e){return __PRIVATE_ensureOnlineComponents(e).then(e=>e.syncEngine)}(e),i,s)),s.promise}(ensureFirestoreConfigured(e),i)}function __PRIVATE_convertToDocSnapshot(e,i,s){const o=s.docs.get(i._key),l=new __PRIVATE_ExpUserDataWriter(e);return new DocumentSnapshot(e,l,i._key,o,new SnapshotMetadata(s.hasPendingWrites,s.fromCache),i.converter)}
/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class WriteBatch{constructor(e,i){this._firestore=e,this._commitHandler=i,this._mutations=[],this._committed=!1,this._dataReader=__PRIVATE_newUserDataReader(e)}set(e,i,s){this._verifyNotCommitted();const o=__PRIVATE_validateReference(e,this._firestore),l=__PRIVATE_applyFirestoreDataConverter(o.converter,i,s),h=__PRIVATE_parseSetData(this._dataReader,"WriteBatch.set",o._key,l,null!==o.converter,s);return this._mutations.push(h.toMutation(o._key,Precondition.none())),this}update(e,i,s,...o){this._verifyNotCommitted();const l=__PRIVATE_validateReference(e,this._firestore);let h;return h="string"==typeof(i=getModularInstance(i))||i instanceof FieldPath?__PRIVATE_parseUpdateVarargs(this._dataReader,"WriteBatch.update",l._key,i,s,o):__PRIVATE_parseUpdateData(this._dataReader,"WriteBatch.update",l._key,i),this._mutations.push(h.toMutation(l._key,Precondition.exists(!0))),this}delete(e){this._verifyNotCommitted();const i=__PRIVATE_validateReference(e,this._firestore);return this._mutations=this._mutations.concat(new __PRIVATE_DeleteMutation(i._key,Precondition.none())),this}commit(){return this._verifyNotCommitted(),this._committed=!0,this._mutations.length>0?this._commitHandler(this._mutations):Promise.resolve()}_verifyNotCommitted(){if(this._committed)throw new FirestoreError(Nt.FAILED_PRECONDITION,"A write batch can no longer be used after commit() has been called.")}}function __PRIVATE_validateReference(e,i){if((e=getModularInstance(e)).firestore!==i)throw new FirestoreError(Nt.INVALID_ARGUMENT,"Provided document reference is from a different Firestore instance.");return e}function serverTimestamp(){return new __PRIVATE_ServerTimestampFieldValueImpl("serverTimestamp")}
/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function writeBatch(e){return ensureFirestoreConfigured(e=__PRIVATE_cast(e,Firestore)),new WriteBatch(e,i=>executeWrite(e,i))}!function(e,i=!0){Dt=Ne,_registerComponent(new Component("firestore",(e,{instanceIdentifier:s,options:o})=>{const l=e.getProvider("app").getImmediate(),h=new Firestore(new __PRIVATE_FirebaseAuthCredentialsProvider(e.getProvider("auth-internal")),new __PRIVATE_FirebaseAppCheckTokenProvider(e.getProvider("app-check-internal")),function(e,i){if(!Object.prototype.hasOwnProperty.apply(e.options,["projectId"]))throw new FirestoreError(Nt.INVALID_ARGUMENT,'"projectId" not provided in firebase.initializeApp.');return new DatabaseId(e.options.projectId,i)}(l,s),l);return o=Object.assign({useFetchStreams:i},o),h._setSettings(o),h},"PUBLIC").setMultipleInstances(!0)),registerVersion(Ct,"4.7.3",e),registerVersion(Ct,"4.7.3","esm2017")}();export{__awaiter as A,getRedirectResult as B,Component as C,signInWithRedirect as D,createUserWithEmailAndPassword as E,FirebaseError as F,GoogleAuthProvider as G,signInWithEmailAndPassword as H,serverTimestamp as I,Ne as S,Timestamp as T,_registerComponent as _,_getProvider as a,getDefaultEmulatorHostnameAndPort as b,getApp as c,createMockUserToken as d,getAuth as e,getFirestore as f,getModularInstance as g,connectFirestoreEmulator as h,initializeApp as i,collection as j,getDocs as k,limit as l,doc as m,setDoc as n,onAuthStateChanged as o,getDoc as p,query as q,registerVersion as r,signOut as s,orderBy as t,updateDoc as u,deleteDoc as v,where as w,onSnapshot as x,writeBatch as y,signInWithPopup as z};
