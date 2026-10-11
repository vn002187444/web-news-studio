import test from 'node:test';
import assert from 'node:assert';
import { markdownToBlocks } from './sanity';

function sanitizeKeys(obj: any): any {
  if (Array.isArray(obj)) {
    return obj.map(sanitizeKeys);
  }
  if (obj && typeof obj === 'object') {
    const newObj: any = {};
    for (const [k, v] of Object.entries(obj)) {
      if (k === '_key' && typeof v === 'string') {
        if (v.startsWith('link-')) {
          newObj[k] = 'mocked-link-mark';
        } else {
          newObj[k] = 'mocked-key';
        }
      } else if (k === 'marks' && Array.isArray(v)) {
        newObj[k] = v.map((mark: any) =>
          (typeof mark === 'string' && mark.startsWith('link-')) ? 'mocked-link-mark' : sanitizeKeys(mark)
        );
      } else {
        newObj[k] = sanitizeKeys(v);
      }
    }
    return newObj;
  }
  return obj;
}

test('markdownToBlocks', async (t) => {
  await t.test('handles basic text', () => {
    const md = 'Hello world';
    const blocks = markdownToBlocks(md);
    const sanitized = sanitizeKeys(blocks);

    assert.deepStrictEqual(sanitized, [
      {
        _type: 'block',
        _key: 'mocked-key',
        style: 'normal',
        children: [
          {
            _type: 'span',
            _key: 'mocked-key',
            text: 'Hello world'
          }
        ],
        markDefs: []
      }
    ]);
  });

  await t.test('handles empty input', () => {
    assert.deepStrictEqual(markdownToBlocks(''), []);
    assert.deepStrictEqual(markdownToBlocks(null as any), []);
    assert.deepStrictEqual(markdownToBlocks('   \n  \n --- \n'), []);
  });

  await t.test('handles h2 and h3', () => {
    const md = '## Heading 2\n### Heading 3';
    const blocks = markdownToBlocks(md);
    const sanitized = sanitizeKeys(blocks);

    assert.deepStrictEqual(sanitized, [
      {
        _type: 'block',
        _key: 'mocked-key',
        style: 'h2',
        children: [
          {
            _type: 'span',
            _key: 'mocked-key',
            text: 'Heading 2'
          }
        ],
        markDefs: []
      },
      {
        _type: 'block',
        _key: 'mocked-key',
        style: 'h3',
        children: [
          {
            _type: 'span',
            _key: 'mocked-key',
            text: 'Heading 3'
          }
        ],
        markDefs: []
      }
    ]);
  });

  await t.test('handles unordered lists', () => {
    const md = '- Item 1\n* Item 2';
    const blocks = markdownToBlocks(md);
    const sanitized = sanitizeKeys(blocks);

    assert.deepStrictEqual(sanitized, [
      {
        _type: 'block',
        _key: 'mocked-key',
        style: 'normal',
        listItem: 'bullet',
        level: 1,
        children: [
          {
            _type: 'span',
            _key: 'mocked-key',
            text: 'Item 1'
          }
        ],
        markDefs: []
      },
      {
        _type: 'block',
        _key: 'mocked-key',
        style: 'normal',
        listItem: 'bullet',
        level: 1,
        children: [
          {
            _type: 'span',
            _key: 'mocked-key',
            text: 'Item 2'
          }
        ],
        markDefs: []
      }
    ]);
  });

  await t.test('handles ordered lists', () => {
    const md = '1. First\n2. Second';
    const blocks = markdownToBlocks(md);
    const sanitized = sanitizeKeys(blocks);

    assert.deepStrictEqual(sanitized, [
      {
        _type: 'block',
        _key: 'mocked-key',
        style: 'normal',
        children: [
          {
            _type: 'span',
            _key: 'mocked-key',
            text: 'First'
          }
        ],
        markDefs: []
      },
      {
        _type: 'block',
        _key: 'mocked-key',
        style: 'normal',
        children: [
          {
            _type: 'span',
            _key: 'mocked-key',
            text: 'Second'
          }
        ],
        markDefs: []
      }
    ]);
  });

  await t.test('handles links', () => {
    const md = 'Check out [Google](https://google.com) and [Bing](https://bing.com)';
    const blocks = markdownToBlocks(md);
    const sanitized = sanitizeKeys(blocks);

    assert.deepStrictEqual(sanitized, [
      {
        _type: 'block',
        _key: 'mocked-key',
        style: 'normal',
        children: [
          {
            _type: 'span',
            _key: 'mocked-key',
            text: 'Check out '
          },
          {
            _type: 'span',
            _key: 'mocked-key',
            text: 'Google',
            marks: ['mocked-link-mark']
          },
          {
            _type: 'span',
            _key: 'mocked-key',
            text: ' and '
          },
          {
            _type: 'span',
            _key: 'mocked-key',
            text: 'Bing',
            marks: ['mocked-link-mark']
          }
        ],
        markDefs: [
          {
            _type: 'link',
            _key: 'mocked-link-mark',
            href: 'https://google.com'
          },
          {
            _type: 'link',
            _key: 'mocked-link-mark',
            href: 'https://bing.com'
          }
        ]
      }
    ]);
  });

  await t.test('handles links in lists', () => {
    const md = '- Link: [Example](https://example.com)';
    const blocks = markdownToBlocks(md);
    const sanitized = sanitizeKeys(blocks);

    assert.deepStrictEqual(sanitized, [
      {
        _type: 'block',
        _key: 'mocked-key',
        style: 'normal',
        listItem: 'bullet',
        level: 1,
        children: [
          {
            _type: 'span',
            _key: 'mocked-key',
            text: 'Link: '
          },
          {
            _type: 'span',
            _key: 'mocked-key',
            text: 'Example',
            marks: ['mocked-link-mark']
          }
        ],
        markDefs: [
          {
            _type: 'link',
            _key: 'mocked-link-mark',
            href: 'https://example.com'
          }
        ]
      }
    ]);
  });
});
