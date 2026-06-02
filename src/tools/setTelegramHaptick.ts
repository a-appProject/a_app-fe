import { postEvent } from '@tma.js/sdk-vue';

export function setHaptic() {
  postEvent('web_app_trigger_haptic_feedback', { type: 'impact', impact_style: 'soft' })
}