import { articleType } from './articleType';
import { portableBlocks } from './blocks';
import { authorType, categoryDocType } from './taxonomy';

export const schemaTypes = [articleType, authorType, categoryDocType, ...portableBlocks];
