import { Post } from '../entities/post';
import { MyContex } from '../type';
import { Arg, Ctx, Mutation, Query, Resolver } from 'type-graphql';

@Resolver()
export class PostResolver {
  @Query(() => [Post])
  posts(@Ctx() { em }: MyContex): Promise<Post[]> {
    return em.find(Post, {});
  }

  @Query(() => Post, { nullable: true })
  post(@Arg('id') id: number, @Ctx() { em }: MyContex) {
    return em.findOne(Post, { id });
  }

  @Mutation(() => Post)
  async create(
    @Arg('title') title: string,
    @Ctx() { em }: MyContex
  ): Promise<Post> {
    // @ts-ignore
    const post = await em.create(Post, { title });
    await em.persistAndFlush(post);
    return post;
  }

  @Mutation(() => Post, { nullable: true })
  async updatePost(
    @Arg('id') id: number,
    @Arg('title') title: string,
    @Ctx() { em }: MyContex
  ): Promise<Post | null> {
    const post = await em.findOne(Post, { id });
    if (!post) {
      return null;
    }

    if (typeof title != undefined) {
      post.title = title;
    }
    await em.persistAndFlush(post);
    return post;
  }

  @Mutation(() => Boolean)
  async deletePost(
    @Arg('id') id: number,
    @Ctx() { em }: MyContex
  ): Promise<boolean> {
    await em.nativeDelete(Post, { id });
    return true;
  }
}
