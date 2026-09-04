import { extractUsageFromSse } from './packages/backend/src/routing/proxy/stream-writer';
const trailing = `event: message_delta
data: {"type":"message_delta","delta":{"stop_reason":"tool_use","stop_sequence":null},"usage":{"input_tokens":11,"output_tokens":11,"cache_creation_input_tokens":0,"cache_read_input_tokens":0}}

event: message_stop
data: {"type":"message_stop"}`;

console.log(extractUsageFromSse(trailing));
