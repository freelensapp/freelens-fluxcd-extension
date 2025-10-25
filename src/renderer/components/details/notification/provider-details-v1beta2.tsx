import { Renderer } from "@freelensapp/extensions";
import { observer } from "mobx-react";
import React from "react";
import { Provider } from "../../../k8s/fluxcd/notification/provider-v1beta2";
import { LinkToSecret } from "../../link-to-secret";

const {
  Component: { BadgeBoolean, DrawerItem },
} = Renderer;

export const ProviderDetails: React.FC<Renderer.Component.KubeObjectDetailsProps<Provider>> = observer((props) => {
  const { object } = props;
  const namespace = object.getNs();

  return (
    <div>
      <DrawerItem name="Resumed">
        <BadgeBoolean value={!object.spec.suspend} />
      </DrawerItem>
      <DrawerItem name="Channel" hidden={!object.spec.channel}>
        {object.spec.channel}
      </DrawerItem>
      <DrawerItem name="Username" hidden={!object.spec.username}>
        {object.spec.username}
      </DrawerItem>
      <DrawerItem name="Address" hidden={!object.spec.address}>
        {object.spec.address}
      </DrawerItem>
      <DrawerItem name="Timeout" hidden={!object.spec.timeout}>
        {object.spec.timeout}
      </DrawerItem>
      <DrawerItem name="Proxy" hidden={!object.spec.proxy}>
        {object.spec.proxy}
      </DrawerItem>
      <DrawerItem name="Credentials" hidden={!object.spec.secretRef}>
        <LinkToSecret name={object.spec.secretRef?.name} namespace={namespace} />
      </DrawerItem>
      <DrawerItem name="TLS Certificate" hidden={!object.spec.certSecretRef}>
        <LinkToSecret name={object.spec.certSecretRef?.name} namespace={namespace} />
      </DrawerItem>
    </div>
  );
});
