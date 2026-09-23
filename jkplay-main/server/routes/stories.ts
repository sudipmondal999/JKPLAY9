import { Router, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { db } from '../db/index.js';
import { AuthRequest, requireAuth } from '../services/auth.js';
import { Story } from '../../src/types/index.js';

const router = Router();

// GET all stories
router.get('/', (req: AuthRequest, res: Response) => {
  const { category } = req.query;
  let stories = db.stories.filter(s => s.published || (req.user && s.authorId === req.user.id));

  if (category && typeof category === 'string' && category !== 'All') {
    stories = stories.filter(s => s.category.toLowerCase() === category.toLowerCase());
  }

  res.json({
    success: true,
    data: { stories },
  });
});

// GET single story by slug or id
router.get('/:slugOrId', (req: AuthRequest, res: Response) => {
  const param = req.params.slugOrId;
  const story = db.stories.find(s => s.slug === param || s.id === param);
  if (!story) {
    return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Story not found' } });
  }

  // Related stories in same category
  const related = db.stories
    .filter(s => s.id !== story.id && s.category === story.category)
    .slice(0, 3);

  res.json({
    success: true,
    data: { story, related },
  });
});

// POST create story
router.post('/', requireAuth, (req: AuthRequest, res: Response) => {
  try {
    const { title, excerpt, content, coverImage, category, tags, published } = req.body;
    const user = req.user!;

    if (!title || !content) {
      return res.status(400).json({
        success: false,
        error: { code: 'INVALID_INPUT', message: 'Title and content are required' },
      });
    }

    const slug = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '') + `-${Date.now().toString(36)}`;

    // Estimate reading time: ~200 words per minute
    const wordCount = content.split(/\s+/).length;
    const minutes = Math.max(1, Math.ceil(wordCount / 200));

    const newStory: Story = {
      id: `sty_${uuidv4().substring(0, 8)}`,
      title: title.trim(),
      slug,
      excerpt: excerpt?.trim() || content.substring(0, 160) + '...',
      content: content.trim(),
      coverImage: coverImage || 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=800&auto=format&fit=crop&q=80',
      authorId: user.id,
      authorName: user.name,
      category: category || 'Audio Culture',
      tags: Array.isArray(tags) ? tags : ['music', 'stories'],
      readingTime: `${minutes} min read`,
      published: published !== false,
      likesCount: 0,
      likedBy: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    db.addStory(newStory);

    res.status(201).json({
      success: true,
      data: { story: newStory },
      message: 'Story published successfully',
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: err.message } });
  }
});

// PATCH update story
router.patch('/:id', requireAuth, (req: AuthRequest, res: Response) => {
  try {
    const story = db.stories.find(s => s.id === req.params.id);
    if (!story) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Story not found' } });
    }

    if (story.authorId !== req.user!.id && req.user!.role !== 'admin') {
      return res.status(403).json({ success: false, error: { code: 'FORBIDDEN', message: 'Permission denied' } });
    }

    const { title, excerpt, content, coverImage, category, tags, published } = req.body;
    const updated = db.updateStory(story.id, {
      ...(title ? { title: title.trim() } : {}),
      ...(excerpt ? { excerpt: excerpt.trim() } : {}),
      ...(content ? { content: content.trim() } : {}),
      ...(coverImage ? { coverImage } : {}),
      ...(category ? { category } : {}),
      ...(tags ? { tags } : {}),
      ...(published !== undefined ? { published } : {}),
    });

    res.json({
      success: true,
      data: { story: updated },
      message: 'Story updated successfully',
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: err.message } });
  }
});

// DELETE story
router.delete('/:id', requireAuth, (req: AuthRequest, res: Response) => {
  try {
    const story = db.stories.find(s => s.id === req.params.id);
    if (!story) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Story not found' } });
    }

    if (story.authorId !== req.user!.id && req.user!.role !== 'admin') {
      return res.status(403).json({ success: false, error: { code: 'FORBIDDEN', message: 'Permission denied' } });
    }

    db.deleteStory(story.id);
    res.json({ success: true, message: 'Story deleted' });
  } catch (err: any) {
    res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: err.message } });
  }
});

// POST toggle like on story
router.post('/:id/like', requireAuth, (req: AuthRequest, res: Response) => {
  const storyId = req.params.id;
  const userId = req.user!.id;

  const result = db.toggleStoryLike(userId, storyId);
  res.json({
    success: true,
    data: result,
  });
});

export default router;
