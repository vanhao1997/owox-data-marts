import { Navigate, useParams } from 'react-router';

export function InsightsV2Redirect() {
  const { insightId } = useParams<{ insightId?: string }>();
  return <Navigate to={insightId ? `../insights/${insightId}` : '../insights'} replace />;
}
