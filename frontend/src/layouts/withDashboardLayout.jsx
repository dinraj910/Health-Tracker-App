import DashboardLayout from './DashboardLayout';

// HOC for pages that need authentication
export const withDashboardLayout = (
    WrappedComponent,
    { title, fullWidth } = {}
) => {
    return function DashboardPage(props) {
        return (
            <DashboardLayout title={title} fullWidth={fullWidth}>
                <WrappedComponent {...props} />
            </DashboardLayout>
        );
    };
};
