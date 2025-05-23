// Export React hooks for use in components
const { useState, useEffect, useCallback, useMemo } = React;

window.useState = useState;
window.useEffect = useEffect;
window.useCallback = useCallback;
window.useMemo = useMemo;