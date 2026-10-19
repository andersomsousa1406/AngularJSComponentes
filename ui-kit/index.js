import components from './components/index.js';
import toast from './services/toast.js';
export { components };
export const services = [toast];
export default services.concat(components);
