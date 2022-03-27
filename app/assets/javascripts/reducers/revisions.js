import {
  RECEIVE_REVISIONS,
  REVISIONS_LOADING,
  RECEIVE_COURSE_SCOPED_REVISIONS,
  COURSE_SCOPED_REVISIONS_LOADING,
  SORT_REVISIONS
} from '../constants';
import { sortByKey } from '../utils/model_utils';

const initialState = {
  revisions: [],
  limit: 50,
  limitReached: false,
  courseScopedRevisions: [],
  courseScopedLimit: 50,
  courseScopedLimitReached: false,
  sort: {
    key: null,
    sortKey: null,
  },
  revisionsLoaded: false,
  courseScopedRevisionsLoaded: false,
  continueTokens: {}
};

const isLimitReachedCourseSpecific = (revs, limit) => {
  return (revs.length < limit);
};

const isLimitReached = (continueTokens) => {
  // eslint-disable-next-line no-restricted-syntax
  for (const value of Object.values(continueTokens)) {
    if (value !== 'no-continue') {
      return false;
    }
  }
  return true;
};
export default function revisions(state = initialState, action) {
  switch (action.type) {
    case RECEIVE_REVISIONS:
      return {
        ...state,
        revisions: action.data.course.revisions,
        limit: action.limit,
        limitReached: isLimitReached(action.data.continueTokens),
        revisionsLoaded: true,
        continueTokens: action.data.continueTokens
      };
    case RECEIVE_COURSE_SCOPED_REVISIONS:
      return {
        ...state,
        courseScopedRevisions: action.data.course.revisions,
        courseScopedLimit: action.limit,
        courseScopedLimitReached: isLimitReachedCourseSpecific(action.data.course.revisions, action.limit),
        courseScopedRevisionsLoaded: true
      };
    case REVISIONS_LOADING:
      return {
        ...state,
        revisionsLoaded: false
      };
    case COURSE_SCOPED_REVISIONS_LOADING:
      return {
        ...state,
        courseScopedRevisionsLoaded: false
      };
    case SORT_REVISIONS: {
      const absolute = action.key === 'characters';
      const desc = action.key === state.sort.sortKey;
      const sortedRevisions = sortByKey(state.revisions, action.key, null, desc, absolute);
      const sortedCourseScopedRevisions = sortByKey(state.courseScopedRevisions, action.key, null, desc, absolute);
      return { ...state,
        revisions: sortedRevisions.newModels,
        courseScopedRevisions: sortedCourseScopedRevisions.newModels,
        sort: {
          sortKey: desc ? null : action.key,
          key: action.key
        }
      };
    }
    default:
      return state;
  }
}
