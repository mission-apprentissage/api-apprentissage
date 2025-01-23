import type { IPaginationInfo, IPaginationQuery } from "api-alternance-sdk";
import type { Collection, Document, Filter, WithId } from "mongodb";

type Result<T> = {
  data: T[];
  pagination: IPaginationInfo;
};

export async function paginate<D extends Document>(
  collection: Collection<D>,
  query: IPaginationQuery,
  filter: Filter<D>,
  countFilter?: Filter<D>
): Promise<Result<WithId<D>>> {
  const [data, count] = await Promise.all([
    collection
      .find(filter, {
        limit: query.page_size,
        skip: query.page_size * query.page_index,
      })
      .toArray(),
    collection.countDocuments(countFilter ?? filter),
  ]);

  return {
    data,
    pagination: {
      page_count: Math.ceil(count / query.page_size),
      page_size: query.page_size,
      page_index: query.page_index,
    },
  };
}
