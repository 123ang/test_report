export const BUG_TEMPLATES = [
  {
    key: 'login',
    label: 'Login / Auth',
    value: {
      bug: 'Login',
      test: 'Enter invalid credentials and verify error message. Then enter valid credentials and verify redirect.',
      result: '',
      severity: 'High',
      priority: 'High',
      notes: '',
    },
  },
  {
    key: 'cart',
    label: 'Cart / Checkout',
    value: {
      bug: 'Cart',
      test: 'Add items to cart, change quantity, remove item. Proceed to checkout and verify totals.',
      result: '',
      severity: 'Medium',
      priority: 'Medium',
      notes: '',
    },
  },
  {
    key: 'api',
    label: 'API / Data',
    value: {
      bug: 'API',
      test: 'Call endpoint with valid and invalid params. Verify response status and body shape.',
      result: '',
      severity: 'High',
      priority: 'High',
      notes: '',
    },
  },
  {
    key: 'ui',
    label: 'UI / Navigation',
    value: {
      bug: 'UI',
      test: 'Navigate through main flows. Check active state, breadcrumbs, back button.',
      result: '',
      severity: 'Low',
      priority: 'Medium',
      notes: '',
    },
  },
  {
    key: 'custom',
    label: 'Custom',
    value: {
      bug: '',
      test: '',
      result: '',
      severity: 'Low',
      priority: 'Low',
      notes: '',
    },
  },
];

export function getBugTemplate(key) {
  return BUG_TEMPLATES.find((t) => t.key === key)?.value || BUG_TEMPLATES.find((t) => t.key === 'custom').value;
}
