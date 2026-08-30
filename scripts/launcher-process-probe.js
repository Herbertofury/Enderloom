'use strict';

// This fixed, inert child is used only when the Rust service is explicitly
// started in QA mode. Its final argument is Enderloom's process-identity marker.
console.log('enderloom-ipc-stdout');
console.error('enderloom-ipc-stderr');
setTimeout(() => {}, 120000);
