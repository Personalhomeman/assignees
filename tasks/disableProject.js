const gh = require('../helpers/github');
const Repository = require('../models/Repository');
const User = require('../models/User');

/**
 * config = {
 *   logger: { info: Function, error: Function },
 * }
 */
exports.configure = config => async ({ owner, repo, repository, force = false }) => {
  if (!repository) {
    repository = await Repository.findOne({
      name: repo,
      owner,
    })
    .catch(() => null);
  }

  if (!repository) {
    config.logger.error(`No project found for "${repository.owner}/${repository.name}".`);
    return;
  }

  if (!repository.github_hook_id) {
    config.logger.error('No webhook registered for this project.');
    return;
  }

  if (!repository.enabled_by || !repository.enabled_by.user_id) {
    config.logger.error(`Cannot find a user ID for this repository.`);
    return;
  }

  try {
    const user = await User.findOneById(repository.enabled_by.user_id);

    if (!user) {
      config.logger.error(`User not found`);
      return;
    }

    await gh.auth(user).repos.deleteHook({
      owner: repository.owner,
      repo: repository.name,
      id: repository.github_hook_id,
    });
  } catch (err) {
    config.logger.error(`"${repository.owner}/${repository.name}" has not been disabled because of an error:`);
    config.logger.error(err.message || err);

    if (!force) {
      return;
    }
  }

  await repository.set({
    enabled: false,
    github_hook_id: undefined,
  }).save();

  config.logger.info(`${repository.owner}/${repository.name} successfully disabled.`);
};
