import {
  cultureCommunities,
  cultureCreators,
  cultureEvents as fixtureEvents,
  cultureImages,
  cultureScenes,
} from '../culture-demo';

/**
 * Culture demo records remain available for explicitly labeled editorial/sample
 * presentation. In production they must not be promoted into actionable Moment
 * records through `.find()` lookup.
 */
const cultureEvents = import.meta.env.DEV
  ? fixtureEvents
  : new Proxy(fixtureEvents, {
      get(target, property, receiver) {
        if (property === 'find' || property === 'findIndex') {
          return () => undefined;
        }
        return Reflect.get(target, property, receiver);
      },
    });

export {
  cultureCommunities,
  cultureCreators,
  cultureEvents,
  cultureImages,
  cultureScenes,
};
