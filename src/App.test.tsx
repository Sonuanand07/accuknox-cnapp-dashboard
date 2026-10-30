import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Provider } from 'react-redux';
import App from './App';
import { createAppStore } from './store';

function setup() {
  const store = createAppStore({ storage: null });
  const user = userEvent.setup();
  render(<Provider store={store}><App /></Provider>);
  return { store, user };
}
const region = (name: string) => within(screen.getByRole('region', { name }));
const widgetHeading = (name: string) => screen.queryByRole('heading', { level: 3, name });

describe('Dashboard', () => {
  it('renders every category with its default widgets, built from the JSON', () => {
    setup();
    for (const title of ['CSPM Executive Dashboard', 'CWPP Dashboard', 'Registry Scan', 'Ticket Dashboard']) {
      expect(screen.getByRole('heading', { level: 2, name: title })).toBeInTheDocument();
    }
    expect(widgetHeading('Cloud Accounts')).toBeInTheDocument();
    expect(widgetHeading('Image Risk Assessment')).toBeInTheDocument();
    expect(screen.getAllByText('No Graph data available!')).toHaveLength(2);
    expect(widgetHeading('Compliance Score')).not.toBeInTheDocument();
    expect(screen.getByText('Connected (2)')).toBeInTheDocument();
    expect(screen.getByText('1470')).toBeInTheDocument();
  });

  it('removes a widget with its cross icon and can undo it from the toast', async () => {
    const { user } = setup();
    await user.click(screen.getByRole('button', { name: 'Remove Cloud Accounts from CSPM Executive Dashboard' }));
    expect(widgetHeading('Cloud Accounts')).not.toBeInTheDocument();
    expect(screen.getByRole('status')).toHaveTextContent('Removed “Cloud Accounts” from CSPM Executive Dashboard');
    await user.click(screen.getByRole('button', { name: 'Undo' }));
    expect(widgetHeading('Cloud Accounts')).toBeInTheDocument();
  });
});

describe('Add Widget drawer', () => {
  it('opens on the category whose "+ Add Widget" card was used', async () => {
    const { user } = setup();
    await user.click(screen.getByRole('button', { name: 'Add widget to CWPP Dashboard' }));
    expect(screen.getByRole('dialog', { name: 'Add Widget' })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /CWPP/ })).toHaveAttribute('aria-selected', 'true');
  });

  it('creates a widget from a name and text, adds it to that category and shows it', async () => {
    const { user } = setup();
    await user.click(screen.getByRole('button', { name: 'Add widget to CWPP Dashboard' }));
    await user.type(screen.getByLabelText('Widget name'), 'Patch status');
    await user.type(screen.getByLabelText('Widget text'), 'All nodes are patched.');
    await user.click(screen.getByRole('button', { name: 'Add to CWPP' }));
    expect(screen.getByRole('checkbox', { name: /Patch status/ })).toBeChecked();
    await user.click(screen.getByRole('button', { name: 'Confirm' }));
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    const cwpp = region('CWPP Dashboard');
    expect(cwpp.getByRole('heading', { level: 3, name: 'Patch status' })).toBeInTheDocument();
    expect(cwpp.getByText('All nodes are patched.')).toBeInTheDocument();
    expect(cwpp.getByText('Custom')).toBeInTheDocument();
  });

  it('adds an existing library widget by ticking it, and removes one by unticking it', async () => {
    const { user } = setup();
    await user.click(screen.getByRole('button', { name: 'Add Widget' }));
    await user.click(screen.getByRole('checkbox', { name: /Compliance Score/ }));
    await user.click(screen.getByRole('checkbox', { name: /^Cloud Accounts/ }));
    expect(screen.getByText('2 pending changes')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Confirm' }));
    expect(widgetHeading('Compliance Score')).toBeInTheDocument();
    expect(widgetHeading('Cloud Accounts')).not.toBeInTheDocument();
  });

  it('discards the draft on Cancel and closes on Escape', async () => {
    const { user } = setup();
    await user.click(screen.getByRole('button', { name: 'Add Widget' }));
    await user.click(screen.getByRole('checkbox', { name: /Compliance Score/ }));
    await user.click(screen.getByRole('button', { name: 'Cancel' }));
    expect(widgetHeading('Compliance Score')).not.toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Add Widget' }));
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    await user.keyboard('{Escape}');
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('searches across ALL widgets, not just the active tab', async () => {
    const { user } = setup();
    await user.click(screen.getByRole('button', { name: 'Add Widget' }));
    await user.type(screen.getByRole('searchbox', { name: 'Search all widgets' }), 'runtime');
    expect(screen.getByText('2 results across all categories')).toBeInTheDocument();
    expect(screen.getByRole('checkbox', { name: /Runtime Policy Violations/ })).toBeInTheDocument();
    expect(screen.getByRole('checkbox', { name: /Workload Alerts/ })).toBeInTheDocument();
    expect(screen.queryByRole('checkbox', { name: /Compliance Score/ })).not.toBeInTheDocument();
    await user.clear(screen.getByRole('searchbox', { name: 'Search all widgets' }));
    await user.type(screen.getByRole('searchbox', { name: 'Search all widgets' }), 'zzzz');
    expect(screen.getByText('No widgets match “zzzz”.')).toBeInTheDocument();
  });

  it('validates the create form: required fields and duplicate names', async () => {
    const { user } = setup();
    await user.click(screen.getByRole('button', { name: 'Add widget to CWPP Dashboard' }));
    await user.click(screen.getByRole('button', { name: 'Add to CWPP' }));
    expect(screen.getByText('Enter a widget name.')).toBeInTheDocument();
    expect(screen.getByText('Enter the widget text.')).toBeInTheDocument();
    await user.type(screen.getByLabelText('Widget name'), 'workload alerts');
    await user.type(screen.getByLabelText('Widget text'), 'x');
    await user.click(screen.getByRole('button', { name: 'Add to CWPP' }));
    expect(screen.getByText(/already exists in CWPP Dashboard/)).toBeInTheDocument();
  });

  it('permanently deletes a custom widget from the drawer', async () => {
    const { user } = setup();
    await user.click(screen.getByRole('button', { name: 'Add widget to CWPP Dashboard' }));
    await user.type(screen.getByLabelText('Widget name'), 'Temp');
    await user.type(screen.getByLabelText('Widget text'), 'temporary');
    await user.click(screen.getByRole('button', { name: 'Add to CWPP' }));
    await user.click(screen.getByRole('button', { name: 'Delete Temp permanently' }));
    expect(screen.queryByRole('checkbox', { name: /Temp/ })).not.toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Confirm' }));
    expect(widgetHeading('Temp')).not.toBeInTheDocument();
  });
});

describe('Search and toolbar', () => {
  it('filters the dashboard from the top search box and offers a way back', async () => {
    const { user } = setup();
    const box = screen.getByRole('searchbox', { name: /Search widgets on the dashboard/ });
    await user.type(box, 'namespace');
    expect(widgetHeading('Top 5 Namespace Specific Alerts')).toBeInTheDocument();
    expect(widgetHeading('Cloud Accounts')).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Add widget to/ })).not.toBeInTheDocument();
    await user.clear(box);
    await user.type(box, 'zzzz');
    expect(screen.getByText('No widgets match “zzzz”')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Clear search' }));
    expect(widgetHeading('Cloud Accounts')).toBeInTheDocument();
  });

  it('changes the time range from the dropdown', async () => {
    const { user } = setup();
    await user.click(screen.getByRole('button', { name: 'Time range: Last 2 days' }));
    await user.click(screen.getByRole('option', { name: 'Last 7 days' }));
    expect(screen.getByRole('button', { name: 'Time range: Last 7 days' })).toBeInTheDocument();
  });
});
