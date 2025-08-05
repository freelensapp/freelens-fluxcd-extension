import { Renderer } from "@freelensapp/extensions";
import { observer } from "mobx-react";
import React from "react";
import { getConditionClass, getConditionMessage, getConditionText } from "../../components/status-conditions";
import { ImageRepository } from "../../k8s/fluxcd/image/imagerepository";

const {
  Component: { Badge, KubeObjectAge, KubeObjectListLayout },
} = Renderer;

enum sortBy {
  name = "name",
  image = "image",
  namespace = "namespace",
  status = "status",
  ready = "ready",
  age = "age",
}

@observer
export class ImageRepositoriesPage extends React.Component {
  render() {
    const store = ImageRepository.getStore();
    if (!store) return <></>;
    return (
      <KubeObjectListLayout
        tableId="imageRepositoriesTable"
        className="ImageRepositories"
        store={store}
        sortingCallbacks={{
          [sortBy.name]: (imageRepository: ImageRepository) => imageRepository.getName(),
          [sortBy.namespace]: (imageRepository: ImageRepository) => imageRepository.getNs(),
          [sortBy.image]: (imageRepository: ImageRepository) => imageRepository.spec.image,
          [sortBy.ready]: (imageRepository: ImageRepository) => getConditionText(imageRepository),
          [sortBy.status]: (imageRepository: ImageRepository) => getConditionMessage(imageRepository),
          [sortBy.age]: (imageRepository: ImageRepository) => imageRepository.getCreationTimestamp(),
        }}
        searchFilters={[(imageRepository: ImageRepository) => imageRepository.getSearchFields()]}
        renderHeaderTitle="Image Repositories"
        renderTableHeader={[
          { title: "Name", className: "name", sortBy: sortBy.name },
          { title: "Namespace", className: "namespace", sortBy: sortBy.namespace },
          { title: "Image", className: "image", sortBy: sortBy.image },
          { title: "Ready", className: "ready", sortBy: sortBy.ready },
          { title: "Status", className: "status", sortBy: sortBy.status },
          { title: "Age", className: "age", sortBy: sortBy.age },
        ]}
        renderTableContents={(imageRepository: ImageRepository) => [
          imageRepository.getName(),
          imageRepository.getNs(),
          imageRepository.spec.image,
          this.renderStatus(imageRepository),
          getConditionMessage(imageRepository),
          <KubeObjectAge object={imageRepository} key="age" />,
        ]}
      />
    );
  }

  renderStatus(imageRepository: ImageRepository) {
    const className = getConditionClass(imageRepository);
    const text = getConditionText(imageRepository);
    return <Badge key="name" label={text} className={className} />;
  }
}
