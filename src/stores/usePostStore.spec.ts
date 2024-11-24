import { setActivePinia, createPinia } from 'pinia';
import { usePostStore } from '../stores/postStore';
import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';

describe('Post Store', () => {
  let mock: MockAdapter;

  beforeEach(() => {
    setActivePinia(createPinia());
    mock = new MockAdapter(axios);
  });

  afterEach(() => {
    mock.reset();
  });

  it('addPost: добавляет новый пост в состояние', async () => {
    const postStore = usePostStore();

    const newPost = { userId: 1, title: 'New Post', body: 'New Body' };
    const mockResponse = { ...newPost, id: 1 };

    mock.onPost('https://jsonplaceholder.typicode.com/posts').reply(201, mockResponse);

    await postStore.addPost(newPost);

    // Проверяем ключевые поля, игнорируя ID
    expect(postStore.posts[0]).toMatchObject({
      userId: 1,
      title: 'New Post',
      body: 'New Body',
    });
    expect(postStore.error).toBeNull();
  });

  it('editPost: редактирует полученный пост из API', async () => {
    const postStore = usePostStore();

    const existingPost = { userId: 1, id: 1, title: 'Original Title', body: 'Original Body' };
    postStore.posts = [existingPost];

    const updatedPost = { ...existingPost, title: 'Updated Title', body: 'Updated Body' };

    mock.onPut(`https://jsonplaceholder.typicode.com/posts/${existingPost.id}`).reply(200, updatedPost);

    await postStore.editPost(updatedPost);

    expect(postStore.posts[0]).toEqual(updatedPost);
    expect(postStore.error).toBeNull();
  });

  it('editPost: редактирует только локально созданный пост', async () => {
    const postStore = usePostStore();

    const localPost = { userId: 1, id: 101, title: 'Local Post', body: 'Local Body' };
    postStore.posts = [localPost];

    const updatedLocalPost = { ...localPost, title: 'Updated Local Title', body: 'Updated Local Body' };

    await postStore.editPost(updatedLocalPost);

    expect(postStore.posts[0]).toEqual(updatedLocalPost);
    expect(postStore.error).toBeNull();
  });

  it('deletePost: удаляет полученный пост из API', async () => {
    const postStore = usePostStore();

    const existingPost = { userId: 1, id: 1, title: 'Original Title', body: 'Original Body' };
    postStore.posts = [existingPost];

    mock.onDelete(`https://jsonplaceholder.typicode.com/posts/${existingPost.id}`).reply(200);

    await postStore.deletePost(existingPost.id);

    expect(postStore.posts).toEqual([]);
    expect(postStore.error).toBeNull();
  });

  it('deletePost: удаляет локально созданный пост', async () => {
    const postStore = usePostStore();

    const localPost = { userId: 1, id: 101, title: 'Local Post', body: 'Local Body' };
    postStore.posts = [localPost];

    await postStore.deletePost(localPost.id);

    expect(postStore.posts).toEqual([]);
    expect(postStore.error).toBeNull();
  });
});
