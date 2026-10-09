import { jest } from '@jest/globals';
import { markdownToBlocks } from './sanity';

describe('markdownToBlocks', () => {
  let mathRandomSpy: jest.SpyInstance;
  let mockRandomIndex = 0;

  beforeEach(() => {
    // Generate deterministic fake keys like '00000001', '00000002', etc.
    mockRandomIndex = 0;
    mathRandomSpy = jest.spyOn(Math, 'random').mockImplementation(() => {
      mockRandomIndex++;
      const fakeStr = mockRandomIndex.toString().padStart(8, '0');
      // The function does Math.random().toString(36).slice(2, 10)
      // If we return an object with toString that prefixes with "0.",
      // slice(2, 10) will get exactly what follows the dot.
      return {
        toString: () => `0.${fakeStr}`,
      } as any as number;
    });
  });

  afterEach(() => {
    mathRandomSpy.mockRestore();
  });

  it('should parse plain text (with implicit removal of ordered list prefix)', () => {
    // The function removes ^\d+\.\s+ via replace
    const blocks = markdownToBlocks('1. This is a plain text');
    expect(blocks).toEqual([
      {
        _type: 'block',
        _key: '00000002',
        style: 'normal',
        children: [
          {
            _type: 'span',
            _key: '00000001',
            text: 'This is a plain text',
          },
        ],
        markDefs: [],
      },
    ]);
  });

  it('should parse H3 headings', () => {
    const blocks = markdownToBlocks('### H3 Heading');
    expect(blocks).toEqual([
      {
        _type: 'block',
        _key: '00000002',
        style: 'h3',
        children: [
          {
            _type: 'span',
            _key: '00000001',
            text: 'H3 Heading',
          },
        ],
        markDefs: [],
      },
    ]);
  });

  it('should parse H2 headings', () => {
    const blocks = markdownToBlocks('## H2 Heading');
    expect(blocks).toEqual([
      {
        _type: 'block',
        _key: '00000002',
        style: 'h2',
        children: [
          {
            _type: 'span',
            _key: '00000001',
            text: 'H2 Heading',
          },
        ],
        markDefs: [],
      },
    ]);
  });

  it('should parse unordered lists (-)', () => {
    const blocks = markdownToBlocks('- List item 1');
    expect(blocks).toEqual([
      {
        _type: 'block',
        _key: '00000002',
        style: 'normal',
        listItem: 'bullet',
        level: 1,
        children: [
          {
            _type: 'span',
            _key: '00000001',
            text: 'List item 1',
          },
        ],
        markDefs: [],
      },
    ]);
  });

  it('should parse unordered lists (*)', () => {
    const blocks = markdownToBlocks('* List item 2');
    expect(blocks).toEqual([
      {
        _type: 'block',
        _key: '00000002',
        style: 'normal',
        listItem: 'bullet',
        level: 1,
        children: [
          {
            _type: 'span',
            _key: '00000001',
            text: 'List item 2',
          },
        ],
        markDefs: [],
      },
    ]);
  });

  it('should parse links', () => {
    const blocks = markdownToBlocks('Here is a [link](https://example.com) to click.');
    expect(blocks).toEqual([
      {
        _type: 'block',
        _key: '00000005', // children use 0001(text), 0002(link span), 0003(mark key), 0004(text) -> block uses 0005
        style: 'normal',
        children: [
          {
            _type: 'span',
            _key: '00000001',
            text: 'Here is a ',
          },
          {
            _type: 'span',
            _key: '00000002',
            text: 'link',
            marks: ['link-0-00000003'],
          },
          {
            _type: 'span',
            _key: '00000004',
            text: ' to click.',
          },
        ],
        markDefs: [
          {
            _type: 'link',
            _key: 'link-0-00000003',
            href: 'https://example.com',
          },
        ],
      },
    ]);
  });

  it('should parse multiple links in one line', () => {
    const blocks = markdownToBlocks('[link1](url1) and [link2](url2)');
    expect(blocks).toEqual([
      {
        _type: 'block',
        _key: '00000006',
        style: 'normal',
        children: [
          {
            _type: 'span',
            _key: '00000001',
            text: 'link1',
            marks: ['link-0-00000002'],
          },
          {
            _type: 'span',
            _key: '00000003',
            text: ' and ',
          },
          {
            _type: 'span',
            _key: '00000004',
            text: 'link2',
            marks: ['link-1-00000005'],
          },
        ],
        markDefs: [
          {
            _type: 'link',
            _key: 'link-0-00000002',
            href: 'url1',
          },
          {
            _type: 'link',
            _key: 'link-1-00000005',
            href: 'url2',
          },
        ],
      },
    ]);
  });

  it('should ignore empty lines and "---"', () => {
    const blocks = markdownToBlocks('\n---\n\nText');
    expect(blocks.length).toBe(1);
    expect(blocks[0].children[0].text).toBe('Text');
  });

  it('should handle null or undefined input', () => {
    // Cast null as any to test runtime protection
    const blocks1 = markdownToBlocks(null as any);
    expect(blocks1).toEqual([]);

    const blocks2 = markdownToBlocks(undefined as any);
    expect(blocks2).toEqual([]);

    const blocks3 = markdownToBlocks('');
    expect(blocks3).toEqual([]);
  });
});
