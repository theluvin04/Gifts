import {
  useEffect,
  useState,
} from 'react';

import {
  cleanPath,
  resolveAppLocation,
} from '../routing/appRouter';

import type {
  AppLocation,
} from '../routing/appRouter';

const readLocation =
  (): AppLocation => {
    return resolveAppLocation(
      window.location
        .pathname,
      window.location.search
    );
  };

export const useAppNavigation =
  () => {
    const [
      location,
      setLocation,
    ] = useState<AppLocation>(
      readLocation
    );

    const navigate = (
      path: string,
      replace = false
    ) => {
      const current =
        cleanPath(
          window.location
            .pathname
        );

      if (
        current !== path ||
        window.location.search
      ) {
        if (replace) {
          window.history
            .replaceState(
              {},
              '',
              path
            );
        } else {
          window.history
            .pushState(
              {},
              '',
              path
            );
        }
      }

      setLocation(
        readLocation()
      );

      window.scrollTo({
        top: 0,
        behavior: 'instant',
      });
    };

    useEffect(() => {
      const onPopState =
        () => {
          setLocation(
            readLocation()
          );

          window.scrollTo({
            top: 0,
            behavior:
              'instant',
          });
        };

      window.addEventListener(
        'popstate',
        onPopState
      );

      return () => {
        window.removeEventListener(
          'popstate',
          onPopState
        );
      };
    }, []);

    return {
      location,
      navigate,
    };
  };
